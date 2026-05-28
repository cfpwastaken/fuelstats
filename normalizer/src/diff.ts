import fs from "node:fs"
import postgres from "postgres"
import { parse } from "csv-parse"
import { postgresURI } from "./config.js"

const sql = postgres(postgresURI)

const normalized = (
        await sql`
                COPY (
			  SELECT brand, COUNT(*) AS count
			    FROM normalized_stations
			GROUP BY brand
			ORDER BY count DESC
                ) TO stdout WITH CSV HEADER;
        `.readable()
).pipe(parse({
	columns: true,
	skip_empty_lines: true,
	trim: true,
}))

const brands = fs
        .createReadStream("./generated/brands.csv")
        .pipe(parse({
                columns: true,
                skip_empty_lines: true,
                trim: true,
        })
)

function parseSubbrandList(list: string): string[] {
	const regex = /'([^']*)'|(\S+)/g
	const result: string[] = []

	for (const match of list.matchAll(regex)) {
		result.push(match[1] || match[2] || "???")
	}

	return result
}

async function diff() {
	const set1 = new Set<string>()
	const set2 = new Set<string>()
	const awaited_brands: ({ brand: string, list: string[] })[] = []

	for await (const {brand, count} of normalized) {
		set1.add(brand)
	}

	for await (const {brand, count, list} of brands) {
		const parsed_list = parseSubbrandList(list)
		set2.add(brand)
		awaited_brands.push({ brand, list: parsed_list })
	}

	const additions = set2.difference(set1)
	const deletions = set1.difference(set2)
	return {
		additions: [...additions],
		deletions: [...deletions],
		brands: awaited_brands
	}
}

const diffSet = await diff()
const additions = diffSet.additions.map(e => `+ ${e}`)
const deletions = diffSet.deletions.map(e => {
	const super_brand = diffSet.brands.find(entry => entry.list.includes(e))?.brand || "???"
	return `- ${e}${" ".repeat(48 - e.length)}(-> ${super_brand})`
})

console.log(deletions.join("\n") + "\n" + additions.join("\n"))

sql.end()