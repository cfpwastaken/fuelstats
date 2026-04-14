import { db } from "$lib/db.server";
import { json } from "@sveltejs/kit";

export async function GET() {
	const res = await db?.query("SELECT * FROM violator_stations");
	return json(res?.rows);
}