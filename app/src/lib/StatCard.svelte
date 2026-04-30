<script lang="ts">
	import { TrendingDownIcon, TrendingUpIcon } from '@lucide/svelte';
	import * as Card from './components/ui/card';
	import { Badge } from './components/ui/badge';
	import * as Chart from '$lib/components/ui/chart';
	import { LineChart } from 'layerchart';
	import { scaleUtc } from 'd3-scale';
	import { curveLinear } from 'd3-shape';
	import FuelPrice from './components/FuelPrice.svelte';

	let {
		title,
		value,
		change,
		data,
		display = "normal"
	}: {
		title: string;
		value: string;
		change: number;
		display?: "normal" | "price";
		data: {
			date: Date;
			avg: number;
			min: number;
			max: number;
		}[];
	} = $props();
</script>

<Card.Root class="flex-1 min-w-2xs">
	<Card.Header>
		<Card.Description class="text-xl">{title}</Card.Description>
		<Card.Title class="text-5xl font-semibold tabular-nums @[250px]/card:text-3xl">
			{#if display === "price"}
				<FuelPrice price={Number(value)} />
			{:else}
				{value}
			{/if}
		</Card.Title>
		<Card.Action>
			<Badge variant="outline" class="text-md">
				{@const Icon = change > 0 ? TrendingUpIcon : TrendingDownIcon}
				<Icon />
				{Intl.NumberFormat('de-DE', {
					style: 'percent',
					signDisplay: 'exceptZero',
					maximumFractionDigits: 2
				}).format(change)}
			</Badge>
		</Card.Action>
	</Card.Header>
	<Card.Content>
		<Chart.Container
			config={{
				avg: { label: 'Durchschnitt', color: 'var(--chart-1)' },
				min: { label: 'Minimum', color: 'var(--chart-2)' },
				max: { label: 'Maximum', color: 'var(--chart-3)' }
			}}
			class="w-full pl-2"
		>
			<LineChart
				{data}
				x="date"
				xScale={scaleUtc()}
				legend
				series={[
					{
						key: 'avg',
						label: 'Durchschnitt',
						color: 'var(--chart-1)'
					},
					{
						key: 'min',
						label: 'Minimum',
						color: 'var(--chart-2)'
					},
					{
						key: 'max',
						label: 'Maximum',
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
					xAxis: {
						format: (v: Date) => v.toLocaleDateString('de-DE', { month: 'short', day: 'numeric' })
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
	</Card.Content>
</Card.Root>
