import { db } from "$lib/db.server";

const MAX_RANGE_DAYS = 30;

export async function GET({ request }: { request: Request }) {
	const url = new URL(request.url);
	if(!url.searchParams.has("from") || !url.searchParams.has("to")) {
		return new Response(JSON.stringify({ error: "Missing 'from' or 'to' query parameters" }), { status: 400 });
	}
	const from = url.searchParams.get("from")!;
	const to = url.searchParams.get("to")!;
	const from_date = new Date(from);
	const to_date = new Date(to);
	if(isNaN(from_date.getTime()) || isNaN(to_date.getTime())) {
		return new Response(JSON.stringify({ error: "Invalid date format for 'from' or 'to'" }), { status: 400 });
	}
	const range_days = Math.ceil((to_date.getTime() - from_date.getTime()) / (1000 * 60 * 60 * 24));
	if(range_days > MAX_RANGE_DAYS) {
		return new Response(JSON.stringify({ error: `Date range exceeds maximum of ${MAX_RANGE_DAYS} days` }), { status: 400 });
	}

	const res = await db?.query("SELECT * FROM history WHERE timestamp >= $1 AND timestamp < $2 ORDER BY timestamp DESC", [from_date.toDateString(), to_date.toDateString()]);
	return new Response(JSON.stringify(res?.rows), { status: 200 });
}