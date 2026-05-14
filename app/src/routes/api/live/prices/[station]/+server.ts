import { json } from "@sveltejs/kit";
import { prices } from "../../live";

export async function GET({ params }: { params: { station: string } }) {
	const { station } = params;
	if(!station) {
		return new Response(JSON.stringify({ error: "Station UUID is required" }), { status: 400 });
	}

	const res = await prices([station]);

	return json({
		diesel: res.prices[station]?.diesel ?? null,
		e5: res.prices[station]?.e5 ?? null,
		e10: res.prices[station]?.e10 ?? null,
	});
}
