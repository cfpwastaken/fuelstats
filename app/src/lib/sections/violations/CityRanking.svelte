<script lang="ts">
	import * as Select from "$lib/components/ui/select";
	import { config } from "$lib/config.svelte";
	import { SvelteURLSearchParams } from "svelte/reactivity";
	import ViolatorsList from "./ViolatorsList.svelte";
	import { getLocalTimeZone, today } from "@internationalized/date";

	let fuelType = $state("diesel");

	function fetchCityRanking(fuelType: string, postCodeFilter: string | null, cityFilter: string | null) {
		const params = new SvelteURLSearchParams();
		params.append("fuel", fuelType);
		if (postCodeFilter) {
			params.append("postcode", postCodeFilter);
		}
		if (cityFilter) {
			params.append("city", cityFilter);
		}
		return fetch("/fuel/api/rank?" + params.toString()).then((res) => res.json());
	}
</script>

{#if config.postCodeFilter || config.cityFilter}
	<div class="flex items-center gap-4 mt-4">
		<span>Tankstellen mit den besten Preisen für:</span>
		<Select.Root type="single" bind:value={fuelType}>
			<Select.Trigger>
				{fuelType === "diesel" ? "Diesel" : fuelType === "e5" ? "Super" : "Super E10"}
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="diesel">Diesel</Select.Item>
				<Select.Item value="e5">Super</Select.Item>
				<Select.Item value="e10">Super E10</Select.Item>
			</Select.Content>
		</Select.Root>
	</div>

	{#await fetchCityRanking(fuelType, config.postCodeFilter, config.cityFilter) then data}
		<ViolatorsList type="best" date={today(getLocalTimeZone())} violators={data.map((d: { uuid: string }) => ({
			...d,
			station_uuid: d.uuid
		}))} />
	{/await}
{:else}
	<ViolatorsList type="best" date={today(getLocalTimeZone())} violators={[]} />
{/if}