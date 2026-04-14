<script lang="ts">
	import * as Chart from '$lib/components/ui/chart';
	import { LineChart } from 'layerchart';
	import { scaleUtc } from 'd3-scale';
	import { curveLinear } from 'd3-shape';
	import * as Card from '$lib/components/ui/card';
	import { onMount } from 'svelte';
	import { SvelteDate } from 'svelte/reactivity';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import type { DateRange } from 'bits-ui';
	import { getLocalTimeZone, parseDate, today, type DateValue } from '@internationalized/date';
	import { RangeCalendar } from '$lib/components/ui/range-calendar';
	import { Spinner } from '$lib/components/ui/spinner';

	let { uuid } = $props();
	let data: {
		timestamp: string;
		diesel: string;
		e5: string;
		e10: string;
	}[] = $state([]);
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
		const from = new SvelteDate();
		from.setDate(from.getDate() - 29);
		const to = new SvelteDate();
		to.setDate(to.getDate() + 1);
		data = await fetch('api/station/' + _uuid + '/history?from=' + from.toISOString() + '&to=' + to.toISOString()).then((res) => res.json());
		loading = false;
	}

	let range: DateRange = $state({
		start: today(getLocalTimeZone()).subtract({ days: 8 }),
		end: today(getLocalTimeZone()).subtract({ days: 1 })
	});

	let alwaysRange: {
		start: DateValue;
		end: DateValue;
	} = $state({
		start: today(getLocalTimeZone()).subtract({ days: 8 }),
		end: today(getLocalTimeZone()).subtract({ days: 1 })
	});
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="text-2xl font-semibold">Historie</Card.Title>
		<Card.Description
			>Historische Daten für eine Tankstelle</Card.Description
		>
		<Card.Action>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button {...props}>Open</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-auto">
					<Button variant="outline" onclick={() => {
						alwaysRange = {
							start: parseDate(data[data.length - 1].timestamp),
							end: today(getLocalTimeZone()).subtract({ days: 1 })
						}
						range = alwaysRange;
					}}>
						Alles
					</Button>
					<Button variant="outline" onclick={() => {
						alwaysRange = {
							start: today(getLocalTimeZone()).subtract({ days: 14 }),
							end: today(getLocalTimeZone()).subtract({ days: 1 })
						}
						range = alwaysRange;
					}}>
						2 Wochen
					</Button>
					<Button variant="outline" onclick={() => {
						alwaysRange = {
							start: today(getLocalTimeZone()).subtract({ days: 8 }),
							end: today(getLocalTimeZone()).subtract({ days: 1 })
						}
						range = alwaysRange;
					}}>
						7 Tage
					</Button>

					<RangeCalendar bind:value={range} onValueChange={(value) => {
						if(!(value.start && value.end)) return;
						alwaysRange = {
							start: value.start,
							end: value.end
						}
					}} isDateDisabled={(date) => {
						return date.compare(today(getLocalTimeZone()).subtract({ days: 1 })) > 0;
					}} />
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</Card.Action>
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
					e10: { label: 'Super E10', color: 'var(--chart-3)' }
				}}
				class="aspect-auto h-[calc(100vh-10rem)] w-[calc(100%-2rem)] pl-2"
			>
				<LineChart
					data={data.map((agg) => ({
						timestamp: new Date(agg.timestamp),
						diesel: parseFloat(agg.diesel),
						e5: parseFloat(agg.e5),
						e10: parseFloat(agg.e10)
					})).filter(
					(d) =>
						d.timestamp >= alwaysRange.start.toDate(getLocalTimeZone()) &&
						d.timestamp <= alwaysRange.end.toDate(getLocalTimeZone())
				)}
					x="timestamp"
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
		{/if}
	</Card.Content>
</Card.Root>
