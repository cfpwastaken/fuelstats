<script lang="ts">
	import * as Sheet from "$lib/components/ui/sheet";
	import type { Snippet } from "svelte";
	import BrandView from "./BrandView.svelte";
	import { Button } from "../ui/button";

	let { children, brand }: { children: Snippet, brand: string } = $props();
</script>

<Sheet.Root>
	<Sheet.Trigger>
		{@render children?.()}
	</Sheet.Trigger>
	<Sheet.Content class="overflow-y-scroll">
		<Button href={`/fuel/brand/${brand}`} target="_blank" variant="outline" class="m-4 mb-0 w-fit">
			In neuem Tab öffnen
		</Button>
		<BrandView {brand} />
	</Sheet.Content>
</Sheet.Root>
