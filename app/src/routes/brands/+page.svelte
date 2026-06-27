<script lang="ts">
	import { browser } from "$app/environment";
	import { resolve } from "$app/paths";
	import { config } from "$lib/config.svelte";
	import * as Select from "$lib/components/ui/select";

	let scaleBy = $state("stations");

	interface Station {
		brand: string;
		count: number;
		violations: number;
		fines: number;
	}

	function scale(station: Station, allStations: Station[]) {
		if (scaleBy === "stations") {
			return "calc(1rem + " + Math.min(station.count, 100) / 100 + " * 1rem)";
		} else if (scaleBy === "violations") {
			// We need to dynamically determine a max value for violations to scale the font size appropriately
			const maxViolations = Math.max(...allStations.map((s) => s.violations));
			return "calc(1rem + " + Math.min(station.violations, maxViolations) / maxViolations + " * 1rem)";
		} else if (scaleBy === "fines") {
			// We need to dynamically determine a max value for fines to scale the font size appropriately
			const maxFines = Math.max(...allStations.map((s) => s.fines));
			return "calc(1rem + " + Math.min(station.fines, maxFines) / maxFines + " * 1rem)";
		}
	}

	function sort(scaleBy: string) {
		return (a: Station, b: Station) => {
			if (scaleBy === "stations") {
				return b.count - a.count;
			} else if (scaleBy === "violations") {
				return b.violations - a.violations;
			} else if (scaleBy === "fines") {
				return b.fines - a.fines;
			}
		};
	}
</script>

{#if browser}
	<div class="flex items-center gap-2 p-4">
		<span>Sort by:</span>
		<Select.Root type="single" bind:value={scaleBy}>
			<Select.Trigger>
				{scaleBy.charAt(0).toUpperCase() + scaleBy.slice(1)}
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="stations">Stations</Select.Item>
				<Select.Item value="violations">Violations</Select.Item>
				<Select.Item value="fines">Fines</Select.Item>
			</Select.Content>
		</Select.Root>
	</div>
	{#await fetch(`/fuel/api/brands?${config.postCodeFilter ? "postcode=" + config.postCodeFilter : ""}${config.cityFilter ? (config.postCodeFilter ? "&" : "") + "city=" + config.cityFilter : ""}`).then((res) => res.json()) then _brands}
		{#key scaleBy}
			{@const brands = _brands.sort(sort(scaleBy))}
			<div class="flex flex-wrap">
				{#each brands as brand (brand.brand)}
					<div class="p-4 border-b">
						<a href={resolve(`/brand/${brand.brand}`)} class="text-lg hover:underline" style="font-size: {scale(brand, brands)}">
							{brand.brand}
						</a>
					</div>
				{/each}
			</div>
		{/key}
	{/await}
{/if}
