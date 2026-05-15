<script lang="ts">
	import { browser } from "$app/environment";
	import SectionHeader from "$lib/SectionHeader.svelte";
	import StationGraph from "$lib/sections/station/StationGraph.svelte";
	import StationHistory from "$lib/sections/station/StationHistory.svelte";
	import { SvelteDate } from "svelte/reactivity";
	import BrandSheet from "../brand/BrandSheet.svelte";
	import FuelPrice from "../FuelPrice.svelte";
	import Button from "../ui/button/button.svelte";
	import * as Card from "../ui/card";

	let { station }: { station: string } = $props();

	interface Entry {
		uuid: string;
		name: string;
		brand: string;
		street: string;
		house_number: string;
		post_code: string;
		city: string;
		location: string;
		first_active: string;
		violation_count: string;
		total_fees: string;
	}

	function fuelTypeToName(fuel: string) {
		switch (fuel) {
			case "diesel":
				return "Diesel";
			case "e5":
				return "Super";
			case "e10":
				return "Super E10";
			default:
				return fuel;
		}
	}

	function wasYesterday(dateString: string) {
		const date = new Date(dateString);
		const yesterday = new SvelteDate();
		yesterday.setDate(yesterday.getDate() - 1);
		return date.toDateString() === yesterday.toDateString();
	}

	function wasLast7Days(dateString: string) {
		const date = new Date(dateString);
		const last7Days = new SvelteDate();
		last7Days.setDate(last7Days.getDate() - 7);
		return date >= last7Days;
	}
</script>

<div class="m-4 text-lg">
	{#if browser}
		{#await fetch(`/fuel/api/violations/station/${station}`).then((res) => res.json() as Promise<Entry[]>).then((data) => data[0])}
			<p>Laden...</p>
		{:then data}
			<SectionHeader id="station">{data.name}</SectionHeader>
			<p>Marke: 
				<BrandSheet brand={data.brand}>
					<span class="underline cursor-pointer">
						{data.brand}
					</span>
				</BrandSheet>
			</p>
			<p>Adresse: {data.street} {data.house_number}, {data.post_code} {data.city}</p>
			<p>Seit: {new Date(data.first_active).toLocaleString("de-DE")}</p>
			<p>Verstöße: {data.violation_count != null ? Intl.NumberFormat('de-DE').format(parseInt(data.violation_count)) : "Keine"}</p>
			{#await fetch("/fuel/api/station/" + station + "/violations").then((res) => res.json())}
				<p>Letzer Verstoß: ...</p>
				<p>Verstöße gestern: ...</p>
				<p>Verstöße der letzten 7 Tage: ...</p>
			{:then violations}
				<p>Letzter Verstoß: {violations.length > 0 ? new Date(violations.sort((a: { timestamp: string | number | Date; }, b: { timestamp: string | number | Date; }) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0].timestamp).toLocaleString("de-DE") : "Keine Verstöße"}</p>
				<p>Verstöße gestern: {violations.filter((v: { timestamp: string; }) => wasYesterday(v.timestamp)).length}</p>
				<p>Verstöße der letzten 7 Tage: {violations.filter((v: { timestamp: string; }) => wasLast7Days(v.timestamp)).length}</p>
			{/await}
			<p>Gesamtstrafe: {data.total_fees != null ? Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(parseFloat(data.total_fees)) : "Keine"}</p>

			{#await fetch("/fuel/api/live/prices/" + station).then((res) => res.json() as Promise<{diesel: number; e5: number; e10: number}>).then((data) => data)}
				<p>Lade aktuelle Preise...</p>
			{:then prices}
				<ul class="list-disc list-inside">
					<span>Diesel:</span>
					<FuelPrice price={prices.diesel} />
					<span>Super:</span>
					<FuelPrice price={prices.e5} />
					<span>Super E10:</span>
					<FuelPrice price={prices.e10} />
				</ul>
			{/await}

			<div class="flex flex-col gap-4 mt-4">
				<StationGraph uuid={data.uuid} />
				<StationHistory uuid={data.uuid} />
			</div>

			{#await fetch("/fuel/api/station/" + station + "/violations").then((res) => res.json()) then violations}
				<Card.Root class="mt-4">
					<Card.Header>
						<Card.Title>Illegale Preiserhöhungen</Card.Title>
						<Card.Description>
							Alle illegalen Preiserhöhungen von dieser Tankstelle.
						</Card.Description>
					</Card.Header>
					<ul class="ml-4 flex flex-col gap-2">
						<!-- eslint-disable-next-line svelte/require-each-key -->
						{#each violations.sort((a: { timestamp: string; }, b: { timestamp: string; }) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) as violation}
							<li>
								<span>{new Date(violation.timestamp).toLocaleString("de-DE")}</span>
								&middot;
								<span>{fuelTypeToName(violation.fuel)}</span>
								&middot;
								<span>{Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(violation.prev_price)}</span>
								&rarr;
								<span>{Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(violation.price)}</span>
								&middot;
								<span>Wiederholung: {violation.repetition_count}</span>
								&middot;
								<span>{Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(violation.fee)}</span>
							</li>
						{/each}
					</ul>
				</Card.Root>
			{/await}

			<Button variant="secondary" class="mt-8" onclick={() => {
				navigator.clipboard.writeText(`${location.origin}/fuel/station/${data.uuid}`);
				alert("Link kopiert!");
			}}>Link kopieren</Button>
		{:catch error}
			<p>Error loading violations: {error.message}</p>
		{/await}
	{/if}
</div>
