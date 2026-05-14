const API_KEY = process.env.TANKERKOENIG_API_KEY!;

export interface ListResponse {
	ok: boolean;
	license: string;
	data: string;
	status: string;
	stations: {
		id: string;
		name: string;
		brand: string;
		street: string;
		place: string;
		lat: number;
		lng: number;
		diesel: number | null;
		e5: number | null;
		e10: number | null;
		price: number | null;
		dist: number;
		isOpen: boolean;
		houseNumber: string;
		postCode: number;
	}[];
}

export async function list(lat: number, lon: number, rad: number, type: "e5" | "e10" | "diesel" | "all", sort: "price" | "dist"): Promise<ListResponse> {
	const params = new URLSearchParams({
		lat: lat.toString(),
		lon: lon.toString(),
		rad: rad.toString(),
		type,
		sort,
		apikey: API_KEY
	});

	const res = await fetch(`https://creativecommons.tankerkoenig.de/json/list.php?${params.toString()}`);
	return res.json();
}

interface PricesResponse<T extends string> {
	ok: boolean;
	license: string;
	data: string;
	prices: Record<T, {
		status: "open" | "closed" | "no prices";
		e5: number | false | null;
		e10: number | false | null;
		diesel: number | false | null;
	}>
}

export async function prices<T extends string>(ids: T[]): Promise<PricesResponse<T>> {
	const params = new URLSearchParams({
		ids: ids.join(","),
		apikey: API_KEY
	});

	const res = await fetch(`https://creativecommons.tankerkoenig.de/json/prices.php?${params.toString()}`);
	return res.json();
}

interface DetailResponse {
	ok: boolean;
	license: string;
	data: string;
	status: string;
	station: {
		id: string;
		name: string;
		brand: string;
		street: string;
		houseNumber: string;
		postCode: number;
		place: string;
		openingTimes: {
			text: string;
			start: string;
			end: string;
		}[];
		overrides: string[];
		wholeDay: boolean;
		isOpen: boolean;
		e5: number | null;
		e10: number | null;
		diesel: number | null;
		lat: number;
		lng: number;
		state: null;
	}
}

export async function detail(id: string): Promise<DetailResponse> {
	const params = new URLSearchParams({
		id,
		apikey: API_KEY
	});

	const res = await fetch(`https://creativecommons.tankerkoenig.de/json/detail.php?${params.toString()}`);
	return res.json();
}
