import { db } from "$lib/db.server";

export async function GET({ params }: { params: { station: string } }) {
	const { station } = params;
	const res = await db?.query("SELECT timestamp, fuel, price, prev_price, severity, repetition_count, fee FROM illegal_changes WHERE station_uuid = $1", [station]);
	return new Response(JSON.stringify(res?.rows), { status: 200 });
}