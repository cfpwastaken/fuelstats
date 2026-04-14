import { db } from "$lib/db.server";
import { json } from "@sveltejs/kit";

export async function GET() {
	const lastUpdateRes = await db?.query("SELECT timestamp_utc FROM history ORDER BY timestamp DESC LIMIT 1");
	const diskSizeRes = await db?.query("SELECT pg_size_pretty(pg_database_size(current_database())) AS size");
	return json({
		lastUpdate: lastUpdateRes?.rows[0].timestamp_utc,
		diskSize: diskSizeRes?.rows[0].size
	})
}