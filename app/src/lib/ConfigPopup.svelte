<script>
	import { SlidersHorizontalIcon } from "@lucide/svelte";
	import { buttonVariants } from "./components/ui/button";
	import * as Popover from "./components/ui/popover";
	import Checkbox from "./components/ui/checkbox/checkbox.svelte";
	import { config } from "./config.svelte";
	import Label from "./components/ui/label/label.svelte";
	import Input from "./components/ui/input/input.svelte";
</script>

<Popover.Root>
	<Popover.Trigger class={buttonVariants({ variant: "secondary", size: "icon-lg" })}>
		<SlidersHorizontalIcon />
	</Popover.Trigger>
	<Popover.Content>
		<div class="flex items-center gap-2">
			<Checkbox bind:checked={config.showCrudeOil} id="config-show-crude-oil" />
			<Label for="config-show-crude-oil">
				Rohölpreise anzeigen
			</Label>
		</div>

		<Input type="number" placeholder="Postleitzahl-Filter" bind:value={config.postCodeFilter} />
		<Input type="text" placeholder="Stadt-Filter" bind:value={config.cityFilter} />
	</Popover.Content>
</Popover.Root>