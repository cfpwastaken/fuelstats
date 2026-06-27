import { db } from "$lib/db.server";
import { json } from "@sveltejs/kit";

export async function GET({ request }) {
	if(!db) {
		return new Response("", { status: 500 });
	}

	const url = new URL(request.url);
	const params = url.searchParams;
	const postCode = params.get("postcode");
	const city = params.get("city");
	const fuel = params.get("fuel");

	if (!fuel) {
		return new Response("", { status: 400 });
	}

	let res;

	if (postCode) {
		res = await db.query("SELECT * FROM plz_station_rank WHERE post_code = $1 AND fuel_type = $2", [postCode, fuel]);
	} else if (city) {
		res = await db.query("SELECT * FROM plz_station_rank WHERE city = $1 AND fuel_type = $2", [city, fuel]);
	} else {
		return new Response("", { status: 400 });
	}

	return json(res.rows);
}
