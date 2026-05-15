import { db } from "$lib/db.server";
import { json } from "@sveltejs/kit";

const query = "SELECT brand, COUNT(*) AS count FROM normalized_stations GROUP BY brand ORDER BY count DESC";
const queryPostcode = "SELECT brand, COUNT(*) AS count FROM normalized_stations WHERE post_code = $1 GROUP BY brand ORDER BY count DESC";
const queryCity = "SELECT brand, COUNT(*) AS count FROM normalized_stations WHERE city ILIKE $1 GROUP BY brand ORDER BY count DESC";
const queryCityPostcode = "SELECT brand, COUNT(*) AS count FROM normalized_stations WHERE city ILIKE $1 AND post_code = $2 GROUP BY brand ORDER BY count DESC";

export async function GET({ request }) {
	if(!db) {
		return new Response("", { status: 500 });
	}

	const url = new URL(request.url);
	const params = url.searchParams;
	const postCode = params.get("postcode");
	const city = params.get("city");

	let res;

	if (postCode && city) {
		res = await db.query(queryCityPostcode, [city, postCode]);
	} else if (postCode) {
		res = await db.query(queryPostcode, [postCode]);
	} else if (city) {
		res = await db.query(queryCity, [city]);
	} else {
		res = await db.query(query);
	}

	return json(res.rows);
}
