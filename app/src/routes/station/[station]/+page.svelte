<script lang="ts">
	import { page } from "$app/state";
	import StationView from "$lib/components/station/StationView.svelte";

	let station = page.params.station;
</script>

{#if station}
	<StationView {station} />
{/if}
