<script lang="ts">
	import type { Snippet } from "svelte";

	let { id, children }: { id: string, children: Snippet } = $props();
</script>

<h1 class="mb-4 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl" {id}>
	{@render children?.()}
</h1>
