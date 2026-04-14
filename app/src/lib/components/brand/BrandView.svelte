<script lang="ts">
	import { browser } from "$app/environment";
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

			<Button variant="secondary" class="mt-8" onclick={() => {
				navigator.clipboard.writeText(`${location.origin}/fuel/brand/${data.brand}`);
				alert("Link kopiert!");
			}}>Link kopieren</Button>
		{:catch error}
			<p>Error loading violations: {error.message}</p>
		{/await}
	{/if}
</div>
