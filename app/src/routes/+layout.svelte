<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/Header.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /><title>Fuel Stats</title></svelte:head>

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
