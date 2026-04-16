<script lang="ts">
	import SectionHeader from '$lib/SectionHeader.svelte';
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
		value={Intl.NumberFormat('de-DE', {
			style: 'currency',
			currency: 'EUR',
			maximumFractionDigits: 3
		}).format(parseFloat(data.dailyAggregations[0][fuelField(key, 'avg')]))}
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
<DailyAverageGraph />
