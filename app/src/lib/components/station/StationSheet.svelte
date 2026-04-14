<script lang="ts">
	import * as Sheet from "$lib/components/ui/sheet";
	import type { Snippet } from "svelte";
	import StationView from "./StationView.svelte";

	let { children, station }: { children: Snippet, station: string } = $props();
</script>

<Sheet.Root>
	<Sheet.Trigger>
		{@render children?.()}
	</Sheet.Trigger>
	<Sheet.Content>
		<StationView {station} />
	</Sheet.Content>
</Sheet.Root>
