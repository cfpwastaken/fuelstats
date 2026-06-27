import fs from "node:fs"
import { Pool } from "pg"
import { postgresURI } from "./config.js"
import { pipeline } from "node:stream/promises"
import { from } from "pg-copy-streams"

const pool = new Pool({ connectionString: postgresURI })
const sql = await pool.connect()

await sql.query("TRUNCATE TABLE brand_map;");

const stream = sql.query(from("COPY brand_map (raw_brand, normalized) FROM stdin WITH (FORMAT csv)"));
const brandMap = fs.createReadStream("./generated/table.csv");
await pipeline(
	brandMap,
	stream
);
sql.release()
await pool.end()
