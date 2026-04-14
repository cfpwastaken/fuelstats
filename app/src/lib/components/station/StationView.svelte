<script lang="ts">
	import { browser } from "$app/environment";
	import SectionHeader from "$lib/SectionHeader.svelte";
	import BrandSheet from "../brand/BrandSheet.svelte";
	import Button from "../ui/button/button.svelte";

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
</script>

<div class="m-4 text-lg">
	{#if browser}
		{#await fetch(`/fuel/api/violations/station/${station}`).then((res) => res.json() as Promise<Entry[]>).then((data) => data[0])}
			<p>Laden...</p>
		{:then data}
			<SectionHeader id="station">{data.name}</SectionHeader>
			<p>Marke: 
				<BrandSheet brand={data.brand}>
					<span class="underline">
						{data.brand}
					</span>
				</BrandSheet>
			</p>
			<p>Adresse: {data.street} {data.house_number}, {data.post_code} {data.city}</p>
			<p>Seit: {new Date(data.first_active).toLocaleString("de-DE")}</p>
			<p>Verstöße: {Intl.NumberFormat('de-DE').format(parseInt(data.violation_count))}</p>
			<p>Gesamtstrafe: {Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(parseFloat(data.total_fees))}</p>

			<Button variant="secondary" class="mt-8" onclick={() => {
				navigator.clipboard.writeText(`${location.origin}/fuel/station/${data.uuid}`);
				alert("Link kopiert!");
			}}>Link kopieren</Button>
		{:catch error}
			<p>Error loading violations: {error.message}</p>
		{/await}
	{/if}
</div>
