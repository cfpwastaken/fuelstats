import { db } from "$lib/db.server";
import { json } from "@sveltejs/kit";

export async function GET({ params }: { params: { station: string } }) {
	const { station } = params;
	if(!station) {
		return json({ error: "Station UUID is required" }, { status: 400 });
	}
	console.log("Station UUID:", station);
	const res = await db?.query("SELECT * FROM normalized_stations WHERE uuid = $1", [station]);
	if(res?.rows.length === 0) {
		return json({ error: "Station not found" }, { status: 404 });
	}
	return json(res?.rows[0]);
}