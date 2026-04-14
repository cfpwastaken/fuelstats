import { createReadStream } from "fs";
import { readdir } from "fs/promises";
import ora from "ora";
import { Client } from "pg";
import { from as copyFrom } from "pg-copy-streams";
import split2 from "split2";
import through2 from "through2";
import makeEta from "simple-eta";

const db = await new Client({
	host: process.env.DB_HOST || "localhost",
	port: parseInt(process.env.DB_PORT || "5432"),
	user: process.env.DB_USER || "fuel",
	password: process.env.DB_PASSWORD || "fuel",
	database: process.env.DB_NAME || "fuel"
}).connect();

let spinner = ora("...").start();

await db.query("START TRANSACTION");

// See the last timestamp in the database
const { rows: [{ last_timestamp }] } = await db.query<{ last_timestamp: Date | null }>("SELECT MAX(timestamp) AS last_timestamp FROM history");
const startDate = new Date((last_timestamp?.getTime() || 0) + 24 * 60 * 60 * 1000);
startDate.setUTCHours(0, 0, 0, 0);

spinner.stop();

spinner = ora("Gathering CSV files...").start();

const files: string[] = [];
const years = await readdir("./tankerkoenig-data/prices");
for (const year of years.sort((a, b) => parseInt(a) - parseInt(b))) {
	if(parseInt(year) < startDate.getUTCFullYear()) {
		continue;
	}
	const months = await readdir(`./tankerkoenig-data/prices/${year}`);
	for (const month of months.sort((a, b) => parseInt(a) - parseInt(b))) {
		if(parseInt(month) < startDate.getUTCMonth() + 1) {
			continue;
		}
		const monthFiles = await readdir(`./tankerkoenig-data/prices/${year}/${month}`);
		for (const file of monthFiles.sort((a, b) => {
			const dateA = a.split("-").slice(0, 3).join("-");
			const dateB = b.split("-").slice(0, 3).join("-");
			return new Date(dateA).getTime() - new Date(dateB).getTime();
		})) {
			const day = parseInt(file.split("-")[2]);
			if (day < startDate.getUTCDate()) {
				continue;
			}
			if (file.endsWith("-prices.csv")) {
				files.push(`./tankerkoenig-data/prices/${year}/${month}/${file}`);
			}
		}
		spinner.text = `Gathering CSV files... ${year}/${month} (found ${files.length} files so far)`;
	}
}

spinner.succeed(`Gathered ${files.length} CSV files.`);

console.log("Files to process:");
files.forEach(file => console.log(`- ${file}`));

process.stdout.write("Continuing in 5... ")
await new Promise(resolve => setTimeout(resolve, 1000));
process.stdout.write("4... ")
await new Promise(resolve => setTimeout(resolve, 1000));
process.stdout.write("3... ")
await new Promise(resolve => setTimeout(resolve, 1000));
process.stdout.write("2... ")
await new Promise(resolve => setTimeout(resolve, 1000));
process.stdout.write("1... ")
await new Promise(resolve => setTimeout(resolve, 1000));
console.log("Go!");

spinner = ora("Inserting data into database...").start();
const eta = makeEta({
	min: 0,
	max: files.length
});
eta.start();

async function insertFile(file: string) {
	const etaSeconds = eta.estimate();
	const etaString = etaSeconds !== null ? ` (ETA: ${new Date(Date.now() + etaSeconds * 1000).toLocaleTimeString()})` : "";
	spinner.text = `Inserting data into database... (processing file ${file}) ${etaString}`;
	return new Promise<void>((resolve, reject) => {
		const stream = db.query(copyFrom("COPY history (timestamp, station_uuid, diesel, e5, e10, dieselchange, e5change, e10change) FROM STDIN DELIMITER ',' CSV"));
		createReadStream(file)
			.pipe(split2())
			.pipe(through2(function (chunk, _enc, callback) {
				// filter out lines that start with "date"
				if (chunk.toString().startsWith("date")) {
					return callback();
				}

				callback(null, chunk + "\n");
			}))
			.pipe(stream)
			.on("error", (err) => {
				console.error("Error during COPY:", err);
				console.error(`Failed to insert data from file ${file} into database.`);
				reject(err);
			})
			.on("finish", () => {
				resolve();
			});
	});
}

let processedFiles = 0;
for (const file of files) {
	await insertFile(file);
	processedFiles++;
	eta.report(processedFiles);
	await db.query("COMMIT");
	await db.query("START TRANSACTION");
}

spinner.succeed("Finished inserting data into database.");

await db.query("COMMIT");

spinner = ora("Refreshing materialized views...").start();

// Get list of materialized views to refresh
const { rows: views } = await db.query(`
	SELECT matviewname
	FROM pg_matviews
	WHERE schemaname = 'public'
`);

// List of dependency views that should be refreshed first
const DEPENDENCY_ORDER = [
	"normalized_stations",
	"brand_totals",
	"illegal_changes"
];

views.sort((a, b) => {
	const aIndex = DEPENDENCY_ORDER.indexOf(a.matviewname);
	const bIndex = DEPENDENCY_ORDER.indexOf(b.matviewname);
	if (aIndex === -1 && bIndex === -1) {
		return 0;
	}
	if (aIndex === -1) {
		return 1;
	}
	if (bIndex === -1) {
		return -1;
	}
	return aIndex - bIndex;
});

let i = 0;
// Refresh each materialized view
for (const { matviewname } of views) {
	spinner.text = `Refreshing materialized view ${matviewname} (${i + 1}/${views.length})... ${new Date().toLocaleTimeString()}`;
	await db.query(`REFRESH MATERIALIZED VIEW ${matviewname}`);
	i++;
}

spinner.succeed("Finished refreshing materialized views.");

await db.end();
