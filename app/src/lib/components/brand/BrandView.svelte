<script lang="ts">
	import { browser } from "$app/environment";
	import { resolve } from "$app/paths";
	import { config } from "$lib/config.svelte";
	import SectionHeader from "$lib/SectionHeader.svelte";
	import { SvelteDate } from "svelte/reactivity";
	import { Button } from "../ui/button";
	import * as Card from "../ui/card";
	import * as Table from "../ui/table";

	let { brand }: { brand: string } = $props();

	interface Entry {
		brand: string;
		station_count: string;
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
		{#await fetch(`/fuel/api/violations/brand/${brand}`).then((res) => res.json() as Promise<Entry[]>).then((data) => data[0])}
			<p>Laden...</p>
		{:then data}
			<SectionHeader id="brand">{data.brand}</SectionHeader>
			<p>Tankstellen: {Intl.NumberFormat('de-DE').format(parseInt(data.station_count))}</p>
			<p>Verstöße: {Intl.NumberFormat('de-DE').format(parseInt(data.violation_count))}</p>
			{#await fetch("/fuel/api/brand/" + brand + "/violations").then((res) => res.json())}
				<p>Letzer Verstoß: ...</p>
				<p>Verstöße gestern: ...</p>
				<p>Verstöße der letzten 7 Tage: ...</p>
			{:then violations}
				<p>Letzter Verstoß: {violations.length > 0 ? new Date(violations.sort((a: { timestamp: string | number | Date; }, b: { timestamp: string | number | Date; }) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0].timestamp).toLocaleString("de-DE") : "Nie"}</p>
				<p>Verstöße gestern: {violations.filter((v: { timestamp: string; }) => wasYesterday(v.timestamp)).length}</p>
				<p>Verstöße der letzten 7 Tage: {violations.filter((v: { timestamp: string; }) => wasLast7Days(v.timestamp)).length}</p>
			{/await}
			<p>Gesamtstrafe: {Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(parseFloat(data.total_fees))}</p>

			{#await fetch("/fuel/api/brand/" + brand + "/aliases").then((res) => res.json()).then((data) => data)}
				<p>Lade Aliase...</p>
			{:then aliases}
				{#if aliases.length > 0}
					<p>Aliase: {aliases.join(", ")}</p>
				{/if}
			{/await}

			{#await fetch("/fuel/api/brand/" + brand + "/stations").then((res) => res.json() as Promise<{uuid: string; post_code: string; city: string; street: string; house_number: string}[]>).then((data) => data)}
				<p>Lade Stationen...</p>
			{:then stations}
				{@const filteredStations = stations.filter(s => {
					if (config.postCodeFilter && s.post_code != config.postCodeFilter) return false;
					if (config.cityFilter && s.city.toLowerCase() != config.cityFilter.toLowerCase()) return false;
					return true;
				})}
				<details>
					<summary>{filteredStations.length} Tankstellen gefunden.</summary>
					<ul class="list-disc list-outside">
						<!-- eslint-disable-next-line svelte/require-each-key -->
						{#each filteredStations as station}
							<li>
								<a href={resolve(`/station/${station.uuid}`)} class="underline">
									{station.street} {station.house_number}<br>
									{station.post_code} {station.city}
								</a>
							</li>
						{/each}
					</ul>
				</details>
			{/await}

			{#await fetch("/fuel/api/brand/" + brand + "/violations").then((res) => res.json()) then violations}
				{@const filteredViolations = violations.filter((v: { post_code: string; city: string; }) => {
					if (config.postCodeFilter && v.post_code != config.postCodeFilter) return false;
					if (config.cityFilter && v.city.toLowerCase() != config.cityFilter.toLowerCase()) return false;
					return true;
				})}
				<Card.Root class="mt-4">
					<Card.Header>
						<Card.Title>Illegale Preiserhöhungen</Card.Title>
						<Card.Description>
							Alle illegalen Preiserhöhungen von dieser Tankstelle.
						</Card.Description>
					</Card.Header>
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Zeitstempel</Table.Head>
								<Table.Head>Tankstelle</Table.Head>
								<Table.Head>Kraftstoff</Table.Head>
								<Table.Head>Vorheriger Preis</Table.Head>
								<Table.Head>Neuer Preis</Table.Head>
								<Table.Head>Wiederholung</Table.Head>
								<Table.Head>Strafe</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							<!-- eslint-disable-next-line svelte/require-each-key -->
							{#each filteredViolations.sort((a: { timestamp: string; }, b: { timestamp: string; }) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) as violation}
								<Table.Row>
									<Table.Cell>{new Date(violation.timestamp).toLocaleString("de-DE")}</Table.Cell>
									<Table.Cell><a href={resolve(`/station/${violation.uuid}`)} class="underline">{violation.name}</a></Table.Cell>
									<Table.Cell>{fuelTypeToName(violation.fuel)}</Table.Cell>
									<Table.Cell>{Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(violation.prev_price)}</Table.Cell>
									<Table.Cell>{Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(violation.price)}</Table.Cell>
									<Table.Cell>{violation.repetition_count}</Table.Cell>
									<Table.Cell>{Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(violation.fee)}</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.Root>
			{/await}

			<Button variant="secondary" class="mt-8" onclick={() => {
				navigator.clipboard.writeText(`${location.origin}/fuel/brand/${data.brand}`);
				alert("Link kopiert!");
			}}>Link kopieren</Button>
		{:catch error}
			<p>Error loading violations: {error.message}</p>
		{/await}
	{/if}
</div>
