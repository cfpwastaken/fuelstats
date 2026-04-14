<script>
	import SectionHeader from "$lib/SectionHeader.svelte";
	import StationGraph from "./StationGraph.svelte";
	import StationHistory from "./StationHistory.svelte";
	import StationSelector from "./StationSelector.svelte";

	let stationUuid = $state('');
</script>

<SectionHeader id="station">Tankstellen</SectionHeader>
<StationSelector bind:uuid={stationUuid} />
<StationGraph uuid={stationUuid} />
<StationHistory uuid={stationUuid} />