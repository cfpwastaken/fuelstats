import { db } from "$lib/db.server";
import { json } from "@sveltejs/kit";

export async function GET({ params }: { params: { station: string } }) {
	const { station } = params;

	const res = await db?.query(`SELECT * FROM station_violations WHERE uuid = $1`, [station]);

	return json(res?.rows);
}
