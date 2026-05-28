import fs from "node:fs/promises"
import postgres from "postgres"
import { postgresURI } from "./config.js"

const sql = postgres(postgresURI)

const queries = await fs.readFile("./generated/queries.sql", { encoding: "utf-8" })

await sql.unsafe(queries)