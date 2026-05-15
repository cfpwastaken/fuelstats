<script>
	import { browser } from "$app/environment";
	import { ChartNoAxesCombinedIcon, FuelIcon } from "@lucide/svelte";
	import ConfigPopup from "./ConfigPopup.svelte";
	import { resolve } from "$app/paths";
</script>

<header class="p-4 bg-background/60 flex items-center justify-between md:sticky top-0 backdrop-blur-lg z-50 flex-col gap-4 md:flex-row">
	<a class="flex text-3xl transform-3d hover:scale-105 active:scale-95 transition-transform will-change-transform" href={resolve("/")}>
		<FuelIcon size={32} />
		<ChartNoAxesCombinedIcon size={32} />
		<span class="ml-2">
			Fuel Stats
		</span>
	</a>
	<div>
		<nav class="flex items-center gap-4">
			<a href={resolve("/")} class="text-lg hover:underline">
				Startseite
			</a>
			<a href={resolve("/brands")} class="text-lg hover:underline">
				Marken
			</a>
		</nav>
	</div>
	<div class="flex items-center gap-2">
		<ConfigPopup />
		<div class="flex flex-col">
			{#if browser}
				{#await fetch("/fuel/api/data").then((res) => res.json()) then data}
					<span>
						Daten vom:
						{new Date(data.lastUpdate).toLocaleDateString("de-DE", {
							timeZone: "UTC",
							dateStyle: "medium",
						})}
					</span>
					<span>
						Datengröße:
						{data.diskSize}
					</span>
				{/await}
			{/if}
		</div>
	</div>
</header>