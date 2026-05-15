<script>
	import { browser } from "$app/environment";
	import { resolve } from "$app/paths";
	import { config } from "$lib/config.svelte";
</script>

{#if browser}
	{#await fetch(`/fuel/api/brands?${config.postCodeFilter ? "postcode=" + config.postCodeFilter : ""}${config.cityFilter ? (config.postCodeFilter ? "&" : "") + "city=" + config.cityFilter : ""}`).then((res) => res.json()) then brands}
		<div class="flex flex-wrap">
			{#each brands as brand (brand.brand)}
				<div class="p-4 border-b">
					<a href={resolve(`/brand/${brand.brand}`)} class="text-lg hover:underline" style="font-size: calc(1rem + {Math.min(brand.count, 100)} / 100 * 1rem)">
						{brand.brand}
					</a>
				</div>
			{/each}
		</div>
	{/await}
{/if}
