<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { CoinsIcon } from '@lucide/svelte';
	import Badge from '../../components/ui/badge/badge.svelte';
	import * as Select from '../../components/ui/select';
	import type { CalendarDate } from '@internationalized/date';
	import BrandSheet from '$lib/components/brand/BrandSheet.svelte';
	import StationSheet from '$lib/components/station/StationSheet.svelte';

	type Props =
		| {
				type: 'brands';
				date: CalendarDate;
				violators: {
					day: string;
					brand: string;
					is_single: string;
					violations_low: string;
					violations_moderate: string;
					violations_high: string;
					violating_station_count: string;
					total_stations: string;
					violating_percentage: string;
					total_fees: string;
				}[];
		  }
		| {
				type: 'stations';
				date: CalendarDate;
				violators: {
					day: string;
					station_uuid: string;
					brand: string;
					name: string;
					severity: number;
					violations: string;
					street: string;
					house_number: string;
					post_code: string;
					city: string;
					total_fees: string;
				}[];
		  };

	let props: Props = $props();

	let totalViolationCash = $derived(
		props.type === 'brands'
			? props.violators.filter((v) => {
					const vDate = new Date(v.day);
					return (vDate.getFullYear() === props.date.year &&
						vDate.getMonth() + 1 === props.date.month &&
						vDate.getDate() === props.date.day);
				}).reduce(
					(sum, v) =>
						sum +
						parseFloat(v.total_fees),
					0
				)
			: props.violators.filter((v) => {
					const vDate = new Date(v.day);
					return (vDate.getFullYear() === props.date.year &&
						vDate.getMonth() + 1 === props.date.month &&
						vDate.getDate() === props.date.day);
				}).reduce((sum, v) => sum + parseFloat(v.total_fees), 0)
	);

	let violationType = $state<'high' | 'moderate' | 'low'>('high');
	const VIOLATION_TYPES = {
		high: 'Schwere Verstöße',
		moderate: 'Moderate Verstöße',
		low: 'Leichte Verstöße'
	};
</script>

<Card.Root class="flex-1 min-w-2xs">
	<Card.Header>
		<Card.Description class="text-xl">Illegale Preiserhöher ({props.type === 'brands' ? 'Marken' : 'Tankstellen'})</Card.Description>
		<Card.Title
			class="flex items-center gap-4 text-5xl font-semibold tabular-nums @[250px]/card:text-3xl"
		>
			Top {props.type === "brands" ? "10": "5"}
			<Select.Root type="single" bind:value={violationType}>
				<Select.Trigger class="p-5 text-2xl">
					{VIOLATION_TYPES[violationType]}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						{#each Object.entries(VIOLATION_TYPES) as [key, value] (value)}
							<Select.Item value={key} class="text-lg">
								{value}
							</Select.Item>
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>
		</Card.Title>
		<Card.Action>
			<Badge variant="outline" class="flex gap-2 p-3 text-lg">
				<CoinsIcon style="width: 1.25rem !important; height: 1.25rem !important;" />
				{Intl.NumberFormat('de-DE', {
					style: 'currency',
					currency: 'EUR',
					maximumFractionDigits: 0
				}).format(totalViolationCash)}
			</Badge>
		</Card.Action>
	</Card.Header>
	<Card.Content>
		{#if !props.violators || props.violators.length === 0}
			<div class="flex h-[calc(100vh-10rem)] w-[calc(100%-2rem)] items-center justify-center">
				<span class="text-lg">Keine Daten</span>
			</div>
		{:else}
			<div class="flex flex-col gap-4">
				{#if props.type == "brands"}
					{#each props.violators
						.filter((v) => {
							const vDate = new Date(v.day);
							return (vDate.getFullYear() === props.date.year &&
								vDate.getMonth() + 1 === props.date.month &&
								vDate.getDate() === props.date.day)
						})
						.sort((a, b) => {
							const aViolations = parseInt(a[`violations_${violationType}` as keyof typeof a]);
							const bViolations = parseInt(b[`violations_${violationType}` as keyof typeof b]);
							return bViolations - aViolations;
						})
						.slice(0, 10) as violator, i (violator.brand)}
						<div class="flex items-center gap-4">
							<span class="text-2xl">{i + 1}.</span>
							<span
								class="text-lg font-medium"
								title={`${violator.violating_station_count} von ${violator.total_stations} Tankstellen`}
							>
								{Intl.NumberFormat('de-DE', {
									style: 'percent',
									maximumFractionDigits: 2
								}).format(parseFloat(violator.violating_percentage) / 100)}
							</span>
							<BrandSheet brand={violator.brand}>
								<span class="text-lg font-medium cursor-pointer underline"
									>{violator.brand || '(Unbekannt)'}{violator.is_single ? ' (Markenlos)' : ''}</span
								>
							</BrandSheet>
							<span class="flex items-center gap-2 text-lg">
								<Badge variant="destructive" class="text-sm">
									{violator.violations_high}
								</Badge>
								<Badge variant="warning" class="text-sm">
									{violator.violations_moderate}
								</Badge>
								<Badge variant="secondary" class="text-sm">
									{violator.violations_low}
								</Badge>
							</span>
							<div class="text-lg font-medium">
								{Intl.NumberFormat('de-DE', {
									style: 'currency',
									currency: 'EUR',
									maximumFractionDigits: 0
								}).format(parseFloat(violator.total_fees))}
							</div>
						</div>
					{/each}
				{:else if props.type == "stations"}
					{#each props.violators
						.filter((v) => {
							const vDate = new Date(v.day);
							return (vDate.getFullYear() === props.date.year &&
								vDate.getMonth() + 1 === props.date.month &&
								vDate.getDate() === props.date.day)
						})
						.filter((v) => v.severity === (violationType === 'high' ? 2 : violationType === 'moderate' ? 1 : 0))
						.slice(0, 5) as violator, i (violator.station_uuid)}
						<div class="flex flex-col">
							<div class="flex items-center gap-4">
								<span class="text-2xl">{i + 1}.</span>
								<StationSheet station={violator.station_uuid}>
									<span class="text-lg font-medium cursor-pointer underline"
										>{violator.name || '(Unbekannt)'}
										{#if violator.brand}
											<span class="text-lg font-medium text-muted-foreground"
												>({violator.brand})</span
											>
										{/if}
									</span>
								</StationSheet>
								<span class="flex items-center gap-2 text-lg">
									<Badge variant={violator.severity == 2 ? "destructive" : violator.severity == 1 ? "warning" : "secondary"} class="text-sm">
										{violator.violations}
									</Badge>
								</span>
								<span class="text-lg font-medium">
									{Intl.NumberFormat('de-DE', {
										style: 'currency',
										currency: 'EUR',
										maximumFractionDigits: 0
									}).format(parseFloat(violator.total_fees))}
								</span>
							</div>
							<div class="flex items-center gap-4">
								<span class="text-2xl invisible h-0">{i + 1}.</span>
								<span class="text-md font-medium">
									{violator.street} {violator.house_number}
								</span>
							</div>
							<div class="flex items-center gap-4">
								<span class="text-2xl invisible h-0">{i + 1}.</span>
								<span class="text-md font-medium">
									{violator.post_code} {violator.city}
								</span>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		{/if}
	</Card.Content>
</Card.Root>
