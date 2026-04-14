<script lang="ts">
	import * as Chart from '$lib/components/ui/chart';
	import { LineChart } from 'layerchart';
	import { scaleLinear } from 'd3-scale';
	import { curveLinear } from 'd3-shape';
	import * as Card from '$lib/components/ui/card';
	import { onMount } from 'svelte';
	import { Spinner } from '$lib/components/ui/spinner';
	import type { StationAverage } from '$lib/types/StationAverage';

	let { uuid } = $props();
	let data: StationAverage[] = $state([]);
	let loading = $state(false);

	$effect(() => {
		if (uuid) {
			updateData(uuid);
		}
	})
	
	onMount(() => {
		if (uuid) {
			updateData(uuid);
		}
	})

	async function updateData(_uuid: string = uuid) {
		loading = true;
		data = await fetch('api/station/' + _uuid + '/average').then((res) => res.json());
		loading = false;
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="text-2xl font-semibold">Tagesentwicklung</Card.Title>
		<Card.Description
			>Entwicklung der durchschnittlichen Kraftstoffpreise für eine Tankstelle</Card.Description
		>
	</Card.Header>
	<Card.Content>
		{#if !data || data.length === 0}
			<div class="flex h-[calc(100vh-10rem)] w-[calc(100%-2rem)] items-center justify-center">
				{#if loading}
					<span class="flex-1 flex items-center gap-2 text-lg justify-center">
						<Spinner />
						Laden...
					</span>
				{:else}
					<span class="text-lg">Keine Daten</span>
				{/if}
			</div>
		{:else}
			<Chart.Container
				config={{
					diesel: { label: 'Diesel', color: 'var(--chart-1)' },
					e5: { label: 'Super', color: 'var(--chart-2)' },
					e10: { label: 'Super E10', color: 'var(--chart-3)' },
					diesel_median: { label: 'Diesel Median', color: 'var(--chart-4)' },
					e5_median: { label: 'Super Median', color: 'var(--chart-5)' },
					e10_median: { label: 'Super E10 Median', color: 'var(--chart-3)' }
				}}
				class="aspect-auto h-[calc(100vh-10rem)] w-[calc(100%-2rem)] pl-2"
			>
				<LineChart
					data={data.map((agg) => ({
						hour: agg.hour,
						diesel: agg.diesel_avg,
						diesel_median: agg.diesel_median,
						e5: agg.e5_avg,
						e5_median: agg.e5_median,
						e10: agg.e10_avg,
						e10_median: agg.e10_median
					}))}
					x="hour"
					xScale={scaleLinear()}
					legend
					series={[
						{
							key: 'diesel',
							label: 'Diesel',
							color: 'var(--chart-1)'
						},
						{
							key: 'e5',
							label: 'Super',
							color: 'var(--chart-2)'
						},
						{
							key: 'e10',
							label: 'Super E10',
							color: 'var(--chart-3)'
						},
						{
							key: 'diesel_median',
							label: 'Diesel Median',
							color: 'var(--chart-1)'
						},
						{
							key: 'e5_median',
							label: 'Super Median',
							color: 'var(--chart-2)'
						},
						{
							key: 'e10_median',
							label: 'Super E10 Median',
							color: 'var(--chart-3)'
						}
					]}
					yDomain={null}
					props={{
						spline: {
							curve: curveLinear,
							motion: 'tween',
							strokeWidth: 2
						},
						yAxis: {
							format: (v: number) => v.toFixed(2) + ' €'
						},
						highlight: {
							points: {
								r: 4
							}
						}
					}}
				>
					{#snippet tooltip()}
						<Chart.Tooltip hideLabel />
					{/snippet}
				</LineChart>
			</Chart.Container>
		{/if}
	</Card.Content>
</Card.Root>
