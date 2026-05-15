import { db } from "$lib/db.server";
import { json } from "@sveltejs/kit";

export async function GET({ params }: { params: { brand: string } }) {
	const { brand } = params;
	if(!brand) {
		return new Response(JSON.stringify({ error: "Brand is required" }), { status: 400 });
	}

	if(!db) {
		return new Response(JSON.stringify({ error: true }), { status: 500 });
	}

	const stations = await db.query("SELECT * FROM normalized_stations WHERE brand = $1", [brand]);

	return json(stations.rows);
}
