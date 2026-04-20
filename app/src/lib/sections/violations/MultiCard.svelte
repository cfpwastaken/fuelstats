<script lang="ts">
	import { TrendingDownIcon, TrendingUpIcon } from '@lucide/svelte';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import * as Chart from '$lib/components/ui/chart';
	import { LineChart } from 'layerchart';
	import { scaleUtc } from 'd3-scale';
	import { curveLinear } from 'd3-shape';

	let {
		title,
		value,
		change,
		data,
		unit = "none",
		label
	}: {
		title: string;
		value: string;
		change: number;
		unit?: "none" | "currency";
		label?: string;
		data: {
			date: Date;
			total: number;
			low: number;
			moderate: number;
			high: number;
		}[];
	} = $props();
</script>

<Card.Root class="flex-1 min-w-2xs">
	<Card.Header class="relative">
		<Card.Description class="text-xl">{title}</Card.Description>
		<Card.Title class="text-5xl font-semibold tabular-nums @[250px]/card:text-3xl">
			{value}
		</Card.Title>
		<Card.Action>
			<Badge variant="outline" class="text-md absolute top-0 right-4">
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
				total: { label: 'Total', color: 'var(--chart-1)' },
				low: { label: 'Niedrig', color: 'var(--chart-2)' },
				moderate: { label: 'Moderat', color: 'var(--chart-3)' },
				high: { label: 'Hoch', color: 'var(--chart-4)' }
			}}
			class="w-full pl-4"
		>
			<LineChart
				{data}
				x="date"
				xScale={scaleUtc()}
				series={[
					{
						key: 'total',
						label: 'Total',
						color: 'var(--chart-1)'
					},
					{
						key: "low",
						label: "Niedrig",
						color: 'var(--chart-2)'
					},
					{
						key: "moderate",
						label: "Moderat",
						color: 'var(--chart-3)'
					},
					{
						key: "high",
						label: "Hoch",
						color: 'var(--chart-4)'
					}
				]}
				legend
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
						format: (v: number) => Intl.NumberFormat('de-DE', unit == "currency" ? {
							style: 'currency',
							currency: 'EUR',
							maximumFractionDigits: 0
						} : {}).format(v) + (label ? ` ${label}` : '')
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
