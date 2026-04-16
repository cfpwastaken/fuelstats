import { db } from "$lib/db.server";
import { json } from "@sveltejs/kit";

export async function GET({ request }) {
	const url = new URL(request.url);
	const lastDay = new Date();
	lastDay.setDate(lastDay.getDate() - 1);
	const day = new Date(url.searchParams.get("day") || lastDay.toISOString());
	const res = await db?.query(`SELECT * FROM violators WHERE day = $1`, [day]);
	return json(res?.rows);
}