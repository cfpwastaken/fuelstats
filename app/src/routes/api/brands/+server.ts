import { db } from "$lib/db.server";
import { json } from "@sveltejs/kit";

const query = `SELECT
	ns.brand,
	COUNT(*) AS count,
	COALESCE(bv.violation_count, 0) AS violations,
	COALESCE(bv.total_fees, 0) AS fines
FROM normalized_stations ns
LEFT JOIN brand_violations bv ON ns.brand = bv.brand
GROUP BY ns.brand, bv.violation_count, bv.total_fees
ORDER BY count DESC`;
const queryPostcode = `SELECT
	ns.brand,
	COUNT(*) AS count,
	COALESCE(bv.violation_count, 0) AS violations,
	COALESCE(bv.total_fees, 0) AS fines
FROM normalized_stations ns
LEFT JOIN brand_violations bv ON ns.brand = bv.brand
WHERE ns.post_code = $1
GROUP BY ns.brand, bv.violation_count, bv.total_fees
ORDER BY count DESC`;
const queryCity = `SELECT
	ns.brand,
	COUNT(*) AS count,
	COALESCE(bv.violation_count, 0) AS violations,
	COALESCE(bv.total_fees, 0) AS fines
FROM normalized_stations ns
LEFT JOIN brand_violations bv ON ns.brand = bv.brand
WHERE ns.city ILIKE $1
GROUP BY ns.brand, bv.violation_count, bv.total_fees
ORDER BY count DESC`;
const queryCityPostcode = `SELECT
	ns.brand,
	COUNT(*) AS count,
	COALESCE(bv.violation_count, 0) AS violations,
	COALESCE(bv.total_fees, 0) AS fines
FROM normalized_stations ns
LEFT JOIN brand_violations bv ON ns.brand = bv.brand
WHERE ns.city ILIKE $1 AND ns.post_code = $2
GROUP BY ns.brand, bv.violation_count, bv.total_fees
ORDER BY count DESC`;

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
