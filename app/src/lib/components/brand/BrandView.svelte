<script lang="ts">
	import { browser } from "$app/environment";
	import { resolve } from "$app/paths";
	import { config } from "$lib/config.svelte";
	import SectionHeader from "$lib/SectionHeader.svelte";
	import { Button } from "../ui/button";

	let { brand }: { brand: string } = $props();

	interface Entry {
		brand: string;
		station_count: string;
		violation_count: string;
		total_fees: string;
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
				<p>{filteredStations.length} Tankstellen gefunden.</p>
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
