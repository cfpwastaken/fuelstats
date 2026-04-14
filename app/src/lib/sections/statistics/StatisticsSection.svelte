<script lang="ts">
	import SectionHeader from "$lib/SectionHeader.svelte";
	import SingleCard from "$lib/SingleCard.svelte";
	import type { DailyAggregation } from "$lib/types/DailyAggregations";

	let { data }: { data: { dailyAggregations: DailyAggregation[] } } = $props();
</script>

	<SectionHeader id="statistics">Statistiken</SectionHeader>
	<div class="flex flex-wrap gap-4">
		<SingleCard
			title="Preisänderungen"
			data={data.dailyAggregations.slice(0, 30).map((agg) => ({
				date: new Date(agg.day),
				value: parseFloat(agg.price_changes)
			}))}
			change={(parseFloat(data.dailyAggregations[0].price_changes) -
				parseFloat(data.dailyAggregations[1].price_changes)) /
				parseFloat(data.dailyAggregations[1].price_changes)}
			value={Intl.NumberFormat('de-DE', {
				style: 'decimal',
				currency: 'EUR',
				maximumFractionDigits: 3
			}).format(parseFloat(data.dailyAggregations[0].price_changes))}
		/>
		<div class="flex-1"></div>
		<div class="flex-1"></div>
	</div>