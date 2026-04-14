<script lang="ts">
	import { CircleLayer, GeoJSONSource, MapLibre } from 'svelte-maplibre-gl';
	import * as Dialog from '$lib/components/ui/dialog';
	import { buttonVariants } from '../../components/ui/button';
	import { cn } from '../../utils';

	let {
		onclick
	}: {
		onclick: (uuid: string) => void
	} = $props();

	// initial coords for map center (germany)
	const initialCoords = {
		lng: 10.0,
		lat: 51.0
	}
	let zoom = $state(5);

	let open = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={cn(buttonVariants({ variant: "secondary" }), "p-4 text-lg")}>
		Karte
	</Dialog.Trigger>
	<Dialog.Content style="width: 90vw !important; height: 80vh !important; max-width: unset;">
	{#if zoom < 10}
		<span class="fixed top-4 left-4 text-lg bg-background p-4 z-10">Reinzoomen um Tankstellen zu sehen</span>
	{/if}
		<MapLibre class="h-full w-full" style="https://tiles.openfreemap.org/styles/liberty" center={initialCoords} bind:zoom={zoom} onclick={(e) => {
			// Find nearest station to click
			const features = e.target.queryRenderedFeatures(e.point, { layers: ['stations-layer'] });
			const nearest = features.reduce((prev, curr) => {
				const prevDist = Math.sqrt(Math.pow(prev.geometry.coordinates[0] - e.lngLat.lng, 2) + Math.pow(prev.geometry.coordinates[1] - e.lngLat.lat, 2));
				const currDist = Math.sqrt(Math.pow(curr.geometry.coordinates[0] - e.lngLat.lng, 2) + Math.pow(curr.geometry.coordinates[1] - e.lngLat.lat, 2));
				return prevDist < currDist ? prev : curr;
			}, features[0]);
			if (nearest) {
				onclick(nearest.properties.uuid);
				open = false;
			}
		}}>
			<GeoJSONSource id="stations" data="api/stations.geojson">
				<CircleLayer
					id="stations-layer"
					paint={{ 'circle-radius': 10, 'circle-color': 'blue', 'circle-opacity': 0.8 }}
					minzoom={10}
				/>
			</GeoJSONSource>
		</MapLibre>
	</Dialog.Content>
</Dialog.Root>
