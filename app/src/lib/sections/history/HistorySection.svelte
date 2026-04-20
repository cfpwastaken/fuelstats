<script lang="ts">
	import HistoryChart from "$lib/sections/history/HistoryChart.svelte";
	import SectionHeader from "$lib/SectionHeader.svelte";
	import type { DailyAggregation } from "$lib/types/DailyAggregations";
	import DifferenceChart from "./DifferenceChart.svelte";

	let { data }: { data: { dailyAggregations: DailyAggregation[] } } = $props();
</script>

<SectionHeader id="history">Historie</SectionHeader>
<HistoryChart data={data.dailyAggregations} />
<DifferenceChart data={data.dailyAggregations} />
