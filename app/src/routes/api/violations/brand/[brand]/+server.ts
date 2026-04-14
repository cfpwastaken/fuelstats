import { db } from "$lib/db.server";
import { json } from "@sveltejs/kit";

export async function GET({ params }: { params: { brand: string } }) {
	const { brand } = params;

	const res = await db?.query(`SELECT * FROM brand_violations WHERE brand = $1`, [brand]);

	return json(res?.rows);
}
