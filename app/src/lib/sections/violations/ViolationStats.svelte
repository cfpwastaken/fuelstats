<script lang="ts">
	import SingleCard from '$lib/SingleCard.svelte';
	import { type Violation } from "$lib/types/Violation";

	let { violations }: {
		violations: Violation[];
	} = $props();
</script>

<SingleCard
	title="Illegale Preiserhöhungen"
	data={violations.map((v) => ({
		date: new Date(v.day),
		value: parseInt(v.violations) / 1_000
	}))}
	label="k"
	value={Intl.NumberFormat('de-DE').format(parseInt(violations[violations.length - 1].violations))}
	change={(parseInt(violations[violations.length - 1].violations) -
		parseInt(violations[violations.length - 2].violations)) /
		parseInt(violations[violations.length - 2].violations)}
/>
<SingleCard
	title="Illegale Preiserhöher"
	data={violations.map((v) => ({
		date: new Date(v.day),
		value: parseInt(v.violators) / 1_000
	}))}
	label="k"
	value={Intl.NumberFormat('de-DE').format(parseInt(violations[violations.length - 1].violators))}
	change={(parseInt(violations[violations.length - 1].violators) -
		parseInt(violations[violations.length - 2].violators)) /
		parseInt(violations[violations.length - 2].violators)}
/>
<SingleCard
	title="Geschätzte Strafkosten"
	label="M€"
	data={violations.map((v) => {
		return {
			date: new Date(v.day),
			value: parseFloat(v.total_fees) / 1_000_000
		};
	})}
	value={Intl.NumberFormat('de-DE', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0
	}).format(
		violations.reduce(
			(sum, v) =>
				sum +
				parseFloat(v.total_fees),
			0
		)
	)}
	change={violations.length > 1
		? (parseFloat(violations[violations.length - 1].total_fees) -
			parseFloat(violations[violations.length - 2].total_fees)) /
		parseFloat(violations[violations.length - 2].total_fees)
		: 0}
/>
