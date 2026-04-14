import { db } from '$lib/db.server';
import type { StationAverage } from '$lib/types/StationAverage';
import { json } from '@sveltejs/kit';

export async function GET({ params }: { params: { station: string } }) {
	const { station } = params;
	const res = await db?.query<StationAverage>(
		'SELECT * FROM station_avgs WHERE station_uuid = $1 ORDER BY hour',
		[station]
	);
	return json(
		res?.rows.map((row) => {
			row.diesel_avg = parseFloat(row.diesel_avg.toString());
			row.e5_avg = parseFloat(row.e5_avg.toString());
			row.e10_avg = parseFloat(row.e10_avg.toString());
			return row;
		})
	);
}
