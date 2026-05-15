<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/Header.svelte';

	let { children } = $props();

	const description = "Analyse der Kraftstoffpreise in Deutschland. Aktuelle Preise, historische Trends, illegale Preiserhöhungen und mehr. Alle Daten stammen von der Markttransparenzstelle für Kraftstoffe (MTS-K) des Bundeskartellamts.";
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Fuel Stats</title>
	<meta name="description" content={description} />
	<meta property="og:title" content="Fuel Stats" />
	<meta property="og:description" content={description} />
	<meta property="og:image" content="https://cfp.is-a.dev/fuel/meme.jpg" />
	<meta property="og:image:width" content="666" />
	<meta property="og:image:height" content="500" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Fuel Stats" />
	<meta property="og:locale" content="de_DE" />
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:title" content="Fuel Stats">
	<meta name="twitter:description" content={description}>
	<meta name="twitter:image" content="https://cfp.is-a.dev/fuel/meme.jpg">
</svelte:head>

<div class="max-w-dvw">
	<!-- <Sidebar.Provider>
		<AppSidebar />
		<Sidebar.Inset>
			{@render children()}
		</Sidebar.Inset>
	</Sidebar.Provider> -->
	<Header />
	{@render children()}
</div>
