import { db } from "$lib/db.server";
import type { DailyAggregation } from "$lib/types/DailyAggregations";
import { json } from "@sveltejs/kit";

export async function GET() {
	const res = await db?.query<DailyAggregation>("SELECT * FROM daily_aggregations ORDER BY day DESC");
	return json({
		dailyAggregations: res?.rows || [],
	});
}