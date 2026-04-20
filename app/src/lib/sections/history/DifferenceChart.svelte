<script lang="ts">
	import * as Chart from '$lib/components/ui/chart';
	import { LineChart } from 'layerchart';
	import { scaleUtc } from 'd3-scale';
	import { curveLinear } from 'd3-shape';
	import * as Card from '$lib/components/ui/card';
	import * as DropdownMenu from '../../components/ui/dropdown-menu';
	import Button from '../../components/ui/button/button.svelte';
	import RangeCalendar from '../../components/ui/range-calendar/range-calendar.svelte';
	import type { DateRange } from 'bits-ui';
	import {
		fromDate,
		getLocalTimeZone,
		parseDate,
		today,
		type DateValue
	} from '@internationalized/date';
	import { onMount } from 'svelte';
	import type { DailyAggregation } from '$lib/types/DailyAggregations';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';

	let {
		data
	}: {
		data: DailyAggregation[];
	} = $props();

	let range: DateRange = $state({
		start: today(getLocalTimeZone()).subtract({ days: 30 }),
		end: today(getLocalTimeZone()).subtract({ days: 1 })
	});

	let alwaysRange: {
		start: DateValue;
		end: DateValue;
	} = $state({
		start: today(getLocalTimeZone()).subtract({ days: 30 }),
		end: today(getLocalTimeZone()).subtract({ days: 1 })
	});

	onMount(() => {
		console.log('Local timezone: ' + getLocalTimeZone());
	});

	let showOil = $state(false);

	function forwardFillOil(data: DailyAggregation[]): DailyAggregation[] {
		let lastOil: number | null = null;

		return data.map((d) => {
			if (d.crude_oil != null) {
				lastOil = parseFloat(d.crude_oil);
				return d;
			}

			return {
				...d,
				crude_oil: lastOil == null ? null : (lastOil + '')
			};
		});
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="text-2xl font-semibold">Preisdifferenzen</Card.Title>
		<Card.Description>.</Card.Description>
		<Card.Action class="flex items-center">
			<Checkbox bind:checked={showOil} id="show-oil-diff" />
			<Label for="show-oil-diff" class="ml-2">Rohöl anzeigen</Label>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger class="ml-4">
					{#snippet child({ props })}
						<Button {...props}>Open</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-auto">
					<Button
						variant="outline"
						onclick={() => {
							alwaysRange = {
								start: parseDate('2014-01-01'),
								end: today(getLocalTimeZone()).subtract({ days: 1 })
							};
							range = alwaysRange;
						}}
					>
						Alles
					</Button>
					<Button
						variant="outline"
						onclick={() => {
							alwaysRange = {
								start: today(getLocalTimeZone()).subtract({ days: 30 }),
								end: today(getLocalTimeZone()).subtract({ days: 1 })
							};
							range = alwaysRange;
						}}
					>
						30 Tage
					</Button>
					<Button
						variant="outline"
						onclick={() => {
							alwaysRange = {
								start: today(getLocalTimeZone()).subtract({ years: 1 }),
								end: today(getLocalTimeZone()).subtract({ days: 1 })
							};
							range = alwaysRange;
						}}
					>
						1 Jahr
					</Button>

					<RangeCalendar
						bind:value={range}
						onValueChange={(value) => {
							if (!(value.start && value.end)) return;
							alwaysRange = {
								start: value.start,
								end: value.end
							};
						}}
						isDateDisabled={(date) => {
							return date.compare(today(getLocalTimeZone()).subtract({ days: 1 })) > 0;
						}}
					/>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</Card.Action>
	</Card.Header>
	<Card.Content>
		<Chart.Container
			config={{
				diesel_e5: { label: 'Diesel - Super', color: 'var(--chart-1)' },
				e5_e10: { label: 'Super - Super E10', color: 'var(--chart-2)' },
				...(showOil && {
					diesel_crude_oil: { label: 'Diesel - Rohöl', color: 'var(--chart-3)' },
					e5_crude_oil: { label: 'Super - Rohöl', color: 'var(--chart-4)' }
				})
			}}
			class="h-[calc(100%-10rem)] w-[calc(100%-2rem)] pl-2"
		>
			<LineChart
				data={forwardFillOil(data)
					.map((agg) => ({
						date: new Date(agg.day),
						e5_diesel: parseFloat(agg.e5_avg) - parseFloat(agg.diesel_avg),
						e5_e10: parseFloat(agg.e5_avg) - parseFloat(agg.e10_avg),
						diesel_crude_oil: agg.crude_oil ? parseFloat(agg.diesel_avg) - parseFloat(agg.crude_oil) : null,
						e5_crude_oil: agg.crude_oil ? parseFloat(agg.e5_avg) - parseFloat(agg.crude_oil) : null
					}))
					.filter(
						(d) =>
							fromDate(d.date, getLocalTimeZone()).compare(alwaysRange.start) >= 0 &&
							fromDate(d.date, getLocalTimeZone()).compare(alwaysRange.end) <= 0
						// d.date >= alwaysRange.start.toDate(getLocalTimeZone()) &&
						// d.date <= alwaysRange.end.toDate(getLocalTimeZone())
					)}
				x="date"
				xScale={scaleUtc()}
				legend
				series={[
					{
						key: 'e5_diesel',
						label: 'Super - Diesel',
						color: 'var(--chart-1)'
					},
					{
						key: 'e5_e10',
						label: 'Super - Super E10',
						color: 'var(--chart-2)'
					},
					...(showOil
						? [
								{
									key: 'diesel_crude_oil',
									label: 'Diesel - Rohöl',
									color: 'var(--chart-3)'
								},
								{
									key: 'e5_crude_oil',
									label: 'Super - Rohöl',
									color: 'var(--chart-4)'
								}
							]
						: [])
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
