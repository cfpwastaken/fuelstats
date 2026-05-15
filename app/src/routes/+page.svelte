<script lang="ts">
	import type { PageProps } from './$types';
	import PricesSection from '$lib/sections/prices/PricesSection.svelte';
	import HistorySection from '$lib/sections/history/HistorySection.svelte';
	import ViolationsSection from '$lib/sections/violations/ViolationsSection.svelte';

	let { data }: PageProps = $props();
</script>

<div class="flex w-full flex-col gap-4 p-4">
	<PricesSection {data} />
	<HistorySection {data} />
	<!-- <StatisticsSection {data} /> -->
	<ViolationsSection />
</div>
