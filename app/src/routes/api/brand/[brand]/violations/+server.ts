import { db } from "$lib/db.server";

export async function GET({ params }: { params: { brand: string } }) {
	const { brand } = params;
	const res = await db?.query("SELECT timestamp, fuel, price, prev_price, severity, repetition_count, fee, post_code, city, uuid, name FROM illegal_changes WHERE brand = $1 AND timestamp >= '2026-04-01'", [brand]);
	return new Response(JSON.stringify(res?.rows), { status: 200 });
}
