<script lang="ts">
	import { page } from "$app/state";
	import BrandView from "$lib/components/brand/BrandView.svelte";

	let brand = page.params.brand;
</script>

{#if brand}
	<BrandView {brand} />
{/if}
