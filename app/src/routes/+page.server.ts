import { db } from "$lib/db.server";
import type { DailyAggregation } from "$lib/types/DailyAggregations";

export const load = async () => {
	const res = await db?.query<DailyAggregation>("SELECT * FROM daily_aggregations ORDER BY day DESC");
	return {
		dailyAggregations: res?.rows || [],
	};
};