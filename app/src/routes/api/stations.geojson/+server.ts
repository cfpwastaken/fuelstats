import { db } from '$lib/db.server';
import type { Station } from '$lib/types/Station';
import { json } from '@sveltejs/kit';

function wbkHexToLatLon(hex: string): [number, number] {
	const buf = Buffer.from(hex, 'hex');

	// byte order: 1 = little endian
	const littleEndian = buf[0] === 1;

	// SRID starts at byte 5 (4 bytes for geom type)
	// skip: 1 byte (BO) + 4 bytes (type) = 5
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const srid = buf.readUInt32LE(5);

	// coords start at byte 9
	const offset = 9;
	const readDouble = littleEndian
		? (o: number) => buf.readDoubleLE(o)
		: (o: number) => buf.readDoubleBE(o);

	const lon = readDouble(offset); // X
	const lat = readDouble(offset + 8); // Y

	return [lat, lon];
}

let cache: GeoJSON.FeatureCollection | null = null;
let cacheExpiry: number | null = null;

export async function GET() {
	if (cache && cacheExpiry && Date.now() < cacheExpiry) {
		return json(cache);
	}

	const res = await db?.query<Station>('SELECT * FROM stations');
	if(!res) {
		return json({ error: "Failed to fetch stations" }, { status: 500 });
	}
	console.log(wbkHexToLatLon(res.rows[5].location));
	const geojson: GeoJSON.FeatureCollection = {
		type: 'FeatureCollection',
		features: res.rows.map((station) => ({
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: wbkHexToLatLon(station.location).reverse()
			},
			properties: {
				uuid: station.uuid,
				name: station.name,
				brand: station.brand,
				street: station.street,
				house_number: station.house_number,
				post_code: station.post_code,
				city: station.city,
				first_active: station.first_active
			}
		}))
	};
	cache = geojson;
	cacheExpiry = Date.now() + 3600000; // Cache for 10 hours
	return json(geojson);
}
