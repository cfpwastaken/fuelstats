<script lang="ts">
	let { price, class: className }: { price: number | null; class?: string } =
		$props();
</script>

<span
	class={`flex items-start justify-start text-5xl gap-0.5 font-segment ${className ?? ""} tracking-wide`}
>
	{price ? (Math.floor(price * 100) / 100).toFixed(2) : "N/A"}
	<span class="text-2xl">
		{price ? Math.floor(price * 1000) % 10 : "0"}
	</span>
	<span class="ml-3">€</span>
</span>
