<script lang="ts">
	import * as Chart from '$lib/components/ui/chart';
	import { LineChart } from 'layerchart';
	import { scaleUtc } from 'd3-scale';
	import { curveStep } from 'd3-shape';
	import * as Card from '$lib/components/ui/card';
	import { onMount } from 'svelte';
	import { Spinner } from '$lib/components/ui/spinner';
	import type { DailyAverage } from '$lib/types/DailyAverage';

	let data: DailyAverage[] = $state([]);
	let loading = $state(false);
	
	onMount(() => {
		updateData();
	})

	async function updateData() {
		loading = true;
		data = await fetch('api/daily').then((res) => res.json());
		loading = false;
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="text-2xl font-semibold">Tagesentwicklung</Card.Title>
		<Card.Description
			>Entwicklung der durchschnittlichen Kraftstoffpreise</Card.Description
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
				}}
				class="aspect-auto h-[calc(100vh-10rem)] w-[calc(100%-2rem)] pl-2"
			>
				<LineChart
					data={data.map((agg) => {
						const [hour, minute] = agg.time.split(':').map(Number);
						const date = new Date();
						date.setHours(hour, minute, 0, 0);
						return {
							time: date,
							diesel: parseFloat(agg.diesel_avg),
							e5: parseFloat(agg.e5_avg),
							e10: parseFloat(agg.e10_avg),
						}
					})}
					x="time"
					xScale={scaleUtc()}
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
					]}
					yDomain={null}
					props={{
						spline: {
							curve: curveStep,
							motion: 'tween',
							strokeWidth: 2
						},
						yAxis: {
							format: (v: number) => v.toFixed(2) + ' €',
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
