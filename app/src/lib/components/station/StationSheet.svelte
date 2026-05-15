<script lang="ts">
	import * as Sheet from "$lib/components/ui/sheet";
	import type { Snippet } from "svelte";
	import StationView from "./StationView.svelte";
	import Button from "../ui/button/button.svelte";

	let { children, station }: { children: Snippet, station: string } = $props();
</script>

<Sheet.Root>
	<Sheet.Trigger>
		{@render children?.()}
	</Sheet.Trigger>
	<Sheet.Content class="overflow-y-scroll min-w-1/2">
		<Button href={`/fuel/station/${station}`} target="_blank" variant="outline" class="m-4 mb-0 w-fit">
			In neuem Tab öffnen
		</Button>
		<StationView {station} />
	</Sheet.Content>
</Sheet.Root>
