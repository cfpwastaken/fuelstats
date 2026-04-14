<script lang="ts">
	import type { Station } from "$lib/types/Station";

	let { uuid }: { uuid: string } = $props();

	let data: Station | null = $state(null);

	$effect(() => {
		fetch('api/station/' + uuid).then((res) => {
			if (res.ok) {
				res.json().then((json) => {
					data = json;
				});
			} else {
				data = null;
			}
		})
	})
</script>

{#if data}
	{@const first_active = new Date(data.first_active)}
	<span class="flex justify-around">
		<span>{data.name}</span>
		<span>&middot;</span>
		<span>{data.brand}</span>
		<span>&middot;</span>
		<span>{data.street} {data.house_number}, {data.post_code} {data.city}</span>
		{#if first_active > new Date('2014-03-19')}
			<span>&middot;</span>
			<span>Seit {first_active.toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
		{/if}
	</span>
{/if}
