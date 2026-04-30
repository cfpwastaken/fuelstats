<script lang="ts">
	import { browser } from '$app/environment';
	import SectionHeader from '$lib/SectionHeader.svelte';
	import SingleCard from '$lib/SingleCard.svelte';
	import StatCard from '$lib/StatCard.svelte';
	import type { DailyAggregation } from '$lib/types/DailyAggregations';
	import DailyAverageGraph from './DailyAverageGraph.svelte';

	type FuelKey = 'diesel' | 'e5' | 'e10';
	type FuelMetric = 'avg' | 'min' | 'max' | 'median';
	type FuelField<K extends FuelKey, M extends FuelMetric> = `${K}_${M}`;

	const fuelField = <K extends FuelKey, M extends FuelMetric>(
		key: K,
		metric: M
	): FuelField<K, M> => `${key}_${metric}` as FuelField<K, M>;

	let { data }: {
		data: {
			dailyAggregations: DailyAggregation[];
		}
	} = $props();
</script>

{#snippet card(title: string, key: FuelKey)}
	<StatCard
		{title}
		display="price"
		value={data.dailyAggregations[0][fuelField(key, 'avg')]}
		change={(parseFloat(data.dailyAggregations[0][fuelField(key, 'avg')]) -
			parseFloat(data.dailyAggregations[1][fuelField(key, 'avg')])) /
			parseFloat(data.dailyAggregations[1][fuelField(key, 'avg')])}
		data={data.dailyAggregations.slice(0, 30).map((agg) => ({
			date: new Date(agg.day),
			avg: parseFloat(agg[fuelField(key, 'avg')]),
			min: parseFloat(agg[fuelField(key, 'min')]),
			max: parseFloat(agg[fuelField(key, 'max')])
		}))}
	/>
{/snippet}

<SectionHeader id="prices">Preise</SectionHeader>
<div class="flex flex-wrap gap-4">
	{@render card("Diesel Durchschnitt", "diesel")}
	{@render card("Super Durchschnitt", "e5")}
	{@render card("Super E10 Durchschnitt", "e10")}
</div>
<div class="flex flex-wrap gap-4">
	{#if browser}
		{#await fetch("/fuel/api/aggregations/daily/oil").then(res => res.json() as Promise<{ date: string, eur_liter: string }[]>) then res}
			<SingleCard
				title="Rohöl"
				display="price"
				value={res[0]?.eur_liter || '0'}
				change={(res.length > 1
					? (parseFloat(res[0]?.eur_liter || '0') - parseFloat(res[1]?.eur_liter || '0')) /
						parseFloat(res[1]?.eur_liter || '1')
					: 0)}
				data={res.slice(0, 30).map((agg) => ({
					date: new Date(agg.date),
					value: parseFloat(agg.eur_liter || '0'),
				}))}
			/>
		{/await}
	{/if}
	<div class="flex-1"></div>
	<div class="flex-1"></div>
</div>
<DailyAverageGraph />
