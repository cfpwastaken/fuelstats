import { db } from "$lib/db.server";
import { json } from "@sveltejs/kit";

export async function GET({ params }: { params: { brand: string } }) {
	const { brand } = params;

	if(!db) {
		return new Response("", { status: 500 });
	}

	const res = await db.query("SELECT raw_brand AS alias FROM brand_map WHERE normalized = $1", [brand]);

	return json(res.rows.map((row) => row.alias));
}