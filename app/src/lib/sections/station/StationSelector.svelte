<script lang="ts">
	import { onMount } from 'svelte';
	import { Input } from '$lib/components/ui/input';
	import MapSelector from './MapSelector.svelte';
	import StationInfo from './StationInfo.svelte';

	let { uuid = $bindable(), onchange }: {
		uuid: string;
		onchange?: (uuid: string) => void;
	} = $props();

	onMount(() => {
		const searchParams = new URLSearchParams(window.location.search);
		const initialUuid = searchParams.get('uuid');
		if (initialUuid) {
			uuid = initialUuid;
			onchange?.(initialUuid);
		}
	});
</script>

<div class="flex gap-2">
	<Input
		placeholder="Station UUID"
		class="text-lg! py-4"
		bind:value={uuid}
		onchange={() => {
			if (onchange) onchange(uuid);
		}}
	/>
	<MapSelector
		onclick={async (newuuid) => {
			uuid = newuuid;
			if (onchange) onchange(newuuid);
		}}
	/>
</div>
<StationInfo {uuid} />
