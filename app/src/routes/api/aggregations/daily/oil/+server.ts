import { db } from "$lib/db.server";
import { json } from "@sveltejs/kit";

export async function GET() {
	const res = await db?.query("SELECT * FROM crude_oil ORDER BY date DESC");
	return json(res?.rows);
}