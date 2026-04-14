<script lang="ts">
	import * as Sheet from "$lib/components/ui/sheet";
	import type { Snippet } from "svelte";
	import BrandView from "./BrandView.svelte";

	let { children, brand }: { children: Snippet, brand: string } = $props();
</script>

<Sheet.Root>
	<Sheet.Trigger>
		{@render children?.()}
	</Sheet.Trigger>
	<Sheet.Content>
		<BrandView {brand} />
	</Sheet.Content>
</Sheet.Root>
