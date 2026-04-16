<script>
	import { browser } from '$app/environment';
	import { Spinner } from '$lib/components/ui/spinner';
	import SectionHeader from '$lib/SectionHeader.svelte';
	import ViolatorsList from '$lib/sections/violations/ViolatorsList.svelte';
	import { getLocalTimeZone, today } from '@internationalized/date';
	import ViolationStats from './ViolationStats.svelte';
	import ViolationDateSwitcher from './ViolationDateSwitcher.svelte';

	let illegalDate = $state(today(getLocalTimeZone()).subtract({ days: 1 }));
</script>

<SectionHeader id="violations">Illegale Preiserhöhungen</SectionHeader>
<div class="flex flex-wrap gap-4">
	{#if browser}
		{#await fetch('api/violations').then((res) => res.json())}
			<span class="flex flex-1 items-center justify-center gap-2 text-lg">
				<Spinner />
				Laden...
			</span>
			<span class="flex flex-1 items-center justify-center gap-2 text-lg">
				<Spinner />
				Laden...
			</span>
			<span class="flex flex-1 items-center justify-center gap-2 text-lg">
				<Spinner />
				Laden...
			</span>
		{:then violations}
			<ViolationStats {violations} />
		{/await}
	{/if}
</div>
<ViolationDateSwitcher bind:illegalDate />
<div class="flex flex-wrap gap-4">
	{#if browser}
		{#await fetch(`api/violators?day=${illegalDate.toString()}`).then((res) => res.json())}
			<span class="flex flex-1 items-center justify-center gap-2 text-lg">
				<Spinner />
				Laden...
			</span>
		{:then violators}
			<ViolatorsList {violators} type="brands" date={illegalDate} />
		{/await}
	{/if}
	{#if browser}
		{#await fetch(`api/violators/stations?day=${illegalDate.toString()}`).then((res) => res.json())}
			<span class="flex flex-1 items-center justify-center gap-2 text-lg">
				<Spinner />
				Laden...
			</span>
		{:then violators}
			<ViolatorsList {violators} type="stations" date={illegalDate} />
		{/await}
	{/if}
</div>
