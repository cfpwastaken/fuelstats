import fs from "node:fs/promises"
import postgres from "postgres"
import { parse, Parser } from "csv-parse"
import { postgresURI } from "./config.js"
import type { BrandEntry, BrandMap } from "./types.js"

const UNKNOWN_BRAND = "$$unknown$$"
const OTHER_BRAND   = "$$other$$"
const CLOSED_BRAND  = "$$closed$$"

const SUPERMARKET_MARKERS = new Set([
	"supermarkt",
	"marktkauf",
	"edeka",
	"rewe",
	"kaufland",
	"famila",
	"globus",
	"hit",
	"selgros",
	"v markt",
	"v-markt",
	"e center",
	"e-center",
	"c+c",
	"c c",
	"c and c"
])

const GENERIC_ONLY = new Set([
	"tankstelle",
	"tankstation",
	"tankcenter",
	"tankhof",
	"tankstop",
	"tank",
	"station",
	"shop",
	"autohof",
	"truckstop",
	"xpress",
	"express",
	"service",
	"center",
	"markt",
	"automatentankstelle",
	"automatenstation",
	"tanken",
	"waschen",
	"waschcenter",
	"waschpark",
	"carwash",
	"24h",
	"24",
	"247",
	"7",
	"6",
	"22"
])

const sql = postgres(postgresURI)

const parser = (
	await sql`
		copy (
			select brand, count(*) as count
			from stations
			group by brand
			order by count desc
		) to stdout with csv header
	`.readable()
).pipe(parse({
	columns: true,
	skip_empty_lines: true,
	trim: true,
}))

function cleanBrand(value: string) {
	return String(value)
 		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[’'`´"]/g, "")
		.replace(/&/g, " und ")
		.replace(/[^a-z0-9]+/g, " ")
		.replace(/\s+/g, " ")
		.trim()
}

function normalize(brand: string) {
	if (brand == null) return UNKNOWN_BRAND

	const raw = String(brand).trim()
	if (!raw || /^(null|undefined|""|'')$/i.test(raw)) return UNKNOWN_BRAND

	const rawLower = raw.toLowerCase()
	const text = cleanBrand(raw)
	if (!text) return UNKNOWN_BRAND

	const words = new Set(text.split(" ").filter(Boolean))
	const has = (...items: string[]) => items.some(item => words.has(item))
	const contains = (...items: string[]) => items.some(item => text.includes(item))
	const startsWith = (...items: string[]) => items.some(item => text.startsWith(item))

	if (text.includes("freie welle")) return "freie welle"

	if (/\b(geschlossen|nicht mehr aktiv|geloescht|geloscht|stillgelegt)\b/.test(text)) {
		return CLOSED_BRAND
	}

	if (has("aral")) return "aral"
	if (has("shell")) return "shell"
	if (has("esso")) return "esso"

	if (has("totalenergies", "total")) return "totalenergies"
	if (has("agip", "eni")) return "eni"

	if (has("avia") || text.includes("aviaxpress")) return "avia"
	if (has("bft")) return "bft"
	if (has("jet")) return "jet"
	if (has("star")) return "star"
	if (has("hem")) return "hem"
	if (has("raiffeisen")) return "raiffeisen"
	if (has("classic")) return "classic"
	if (has("westfalen")) return "westfalen"
	if (has("q1")) return "q1"
	if (has("hoyer")) return "hoyer"
	if (has("sprint")) return "sprint"
	if (has("baywa")) return "baywa"
	if (has("ed")) return "ed"
	if (has("edi")) return "edi"
	if (has("team")) return "team"
	if (has("orlen")) return "orlen"
	if (has("elan")) return "elan"
	if (has("access")) return "access"
	if (has("pm", "pm24")) return "pm"
	if (has("nordoel")) return "nordoel"
	if (has("markant")) return "markant"
	if (has("score")) return "score"
	if (has("greenline")) return "greenline"
	if (has("calpam")) return "calpam"
	if (has("lanfer")) return "lanfer"
	if (has("gulf")) return "gulf"
	if (has("omv")) return "omv"
	if (has("ran")) return "ran"
	if (has("m1")) return "m1"
	if (has("avex")) return "avex"
	if (has("tankpoint")) return "tankpoint"
	if (has("toptank")) return "toptank"
	if (has("bk")) return "bk"
	if (has("tas")) return "tas"
	if (has("mtb")) return "mtb"
	if (has("allguth")) return "allguth"
	if (has("tamoil")) return "tamoil"
	if (has("pinoil")) return "pinoil"
	if (has("minera")) return "minera"
	if (has("ratio")) return "ratio"
	if (has("sunoil")) return "sunoil"
	if (has("supol")) return "supol"
	if (has("tinq")) return "tinq"
	if (has("leo")) return "leo"
	if (has("fip")) return "fip"
	if (has("mundorf")) return "mundorf"
	if (has("wiro")) return "wiro"
	if (has("hessol")) return "hessol"
	if (has("bergler")) return "bergler"
	if (has("jantzon")) return "jantzon"
	if (has("felta")) return "felta"
	if (has("elo")) return "elo"
	if (has("minol")) return "minol"
	if (has("gasolin")) return "gasolin"
	if (has("dea")) return "dea"
	if (has("dbv")) return "dbv"
	if (has("fina")) return "fina"
	if (has("azur")) return "azur"
	if (has("eco")) return "eco"
	if (has("eixol")) return "eixol"
	if (has("rumag")) return "rumag"
	if (has("winkler")) return "winkler"
	if (has("t")) return "t"
	if (has("pludra")) return "pludra"
	
	if (startsWith("k k") || contains("klaas und kock")) return "k+k"

	if (
		has("frei", "freie", "freier", "freies", "freien") ||
		contains(
			"freietankstelle",
			"freie tankstelle",
			"freie tankst",
			"freie ts",
			"freie sb",
			"markenfreie",
			"freie/esso",
			"freie esso",
			"freie kanne",
			"kaiser freie 24h tankstelle"
		) ||
		/\bfrei\s*tankstelle\b/.test(text) ||
		/\bfrei\s*ts\b/.test(text) ||
		/\bfrei\s*tankst\b/.test(text)
	) {
		return "freie tankstelle"
	}

	if (startsWith("v markt", "v-markt") || text.includes(" v markt")) return "supermarkt-tankstelle"
	if (startsWith("e center", "e-center") || text.includes(" e center")) return "supermarkt-tankstelle"

	if (text.includes("oil!")) return "oil!"

	if (has("sb")) return "sb"
	if (has("ld")) return "ld"

	if (contains("tankpool24")) return "tankpool24"
	if (contains("bavaria petrol")) return "bavaria petrol"

	if ([...words].some(w => SUPERMARKET_MARKERS.has(w))) {
		return "supermarkt-tankstelle"
	}

	if ([...words].every(w => GENERIC_ONLY.has(w) || /^\d+$/.test(w))) {
		return UNKNOWN_BRAND
	}

	return rawLower
}

async function toMap(data: Parser) {
	const map: BrandMap = new Map() // brand: string -> { count: number, raw: Record<brand: string, count: number> }

	for await (let row of data) {
		const brand = normalize(row.brand)
		const count = Number(row.count)
		const entry = map.get(brand) || { count: 0, raw: {} }

		if (isNaN(entry.count) || !count) console.log("toMap!", brand, entry.count, count)
		entry.count += count
		if (row.brand in entry.raw) {
			entry.raw[row.brand]! += count
		} else {
			entry.raw[row.brand] = count
		}

		map.set(brand, entry)
	}

	return map
}

function pickRepresentative(brand: string, entry: BrandEntry) {
	let highestCount = 0

	// console.log("pickFrom", brand, ["unknown", "OTHER", "CLOSED"].includes(brand))
	if ([UNKNOWN_BRAND, OTHER_BRAND, CLOSED_BRAND].includes(brand)) return brand

	for (let subbrand of Object.keys(entry.raw)) {
		if (entry.raw[subbrand]! > highestCount) {
			highestCount = entry.raw[subbrand]!
			brand = subbrand
		}
	}

	return brand
}

function aggregateOther(map: BrandMap) {
	const other: BrandEntry = { count: 0, raw: {} }
        for (let key of map.keys()) {
			const entry = map.get(key)!
			const subbrands = Object.getOwnPropertyNames(entry.raw)

			if (entry.count > 2) continue
			if (subbrands.length > 1) continue

			const rawName = subbrands[0] || ""

			// console.log("aggregating", entry, "into", other)
			other.count += entry.count
			if (other.raw[rawName]) {
				other.raw[rawName]! += entry.count
			} else {
				other.raw[rawName] = entry.count
			}

			map.delete(key)
        }
        map.set(OTHER_BRAND, other)
}

function quoteString(str: string, quote = "\"") {
	return (str == "" || str.includes(" ")) ? `${quote}${str.replaceAll("\"", "\"\"")}${quote}` : str
}

function printBrands(map: BrandMap, shorten = false) {
	const lines = []
	//console.log("hello world")
	for (let [brand, data] of map.entries()) {
		const representative = pickRepresentative(brand, data)
		const subbrands_all = Object.keys(data.raw).map(subbrand => quoteString(subbrand, "'"))
		const subbrands = subbrands_all.length > 6 && shorten ? subbrands_all.filter(subbrand => data.raw[subbrand]! > 5) : subbrands_all
		const diff = subbrands_all.length - subbrands.length
		let list = subbrands.join(" ")

		if (diff > 0) list += `, ... and ${diff} more`
		lines.push(`${quoteString(representative)}, ${data.count}, "${list}"`)
	}
	// console.log(lines.slice(0, 10))
	return lines.join("\n")
}

function escapeSqlLiteral(value: string) {
	return String(value).replace(/'/g, "''")
}

function normalizeKey(value: string) {
	return String(value).trim().toLowerCase()
}

function buildQueries(map: BrandMap) {
	const mapping = []

	for (const [brand, entry] of map.entries()) {
		const representative = pickRepresentative(brand, entry) || brand

		for (const rawBrand of Object.keys(entry.raw)) {
			if (rawBrand == representative) continue
			mapping.push({
				rawBrand,
				representative,
			})
		}
	}

	const seen = new Set()
	const deduped = []

	for (const row of mapping) {
		const key = normalizeKey(row.rawBrand)
		if (seen.has(key)) continue
		seen.add(key)
		deduped.push(row)
	}

	const valuesSql = deduped
		.map(
			(row) =>
				`${quoteString(row.rawBrand)}, ${escapeSqlLiteral(row.representative)}`
		)
		.join("\n")

	const sql = `
TRUNCATE TABLE brand_map;
COPY brand_map (raw_brand, normalized) FROM stdin WITH (FORMAT csv)
${valuesSql}
\\.
`.trim()

	return sql
}

await fs.mkdir("./generated", { recursive: true })

const map = await toMap(parser)
await fs.writeFile("./generated/brands_all.csv", "brand,count,list\n" + printBrands(map) + "\n")

const fullSize = map.size
aggregateOther(map)
console.log("map size:", map.size, "full:", fullSize)
await fs.writeFile("./generated/brands.csv", "brand,count,list\n" + printBrands(map) + "\n")

const queries = buildQueries(map)
await fs.writeFile("./generated/queries.sql", queries + "\n")

sql.end()