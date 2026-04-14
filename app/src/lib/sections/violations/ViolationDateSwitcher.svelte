<script lang="ts">
	import { Button, buttonVariants } from "$lib/components/ui/button";
	import { Calendar } from "$lib/components/ui/calendar";
	import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "$lib/components/ui/dropdown-menu";
	import { CalendarDate, fromDate, getLocalTimeZone, today } from "@internationalized/date";
	import { cn } from "tailwind-variants";

	let {
		illegalDate = $bindable()
	}: {
		illegalDate: CalendarDate
	} = $props();
</script>

	<div class="flex gap-2">
		<Button class="flex-1" onclick={() => {
			console.log("BEFORE: ", illegalDate.toString());
			illegalDate = illegalDate.subtract({ days: 1 });
			console.log("AFTER: ", illegalDate.toString());
		}} disabled={illegalDate.compare(fromDate(new Date(2026, 3, 1), getLocalTimeZone())) <= 0}>
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-big-left-icon lucide-arrow-big-left"><path d="M10.793 19.793a.707.707 0 0 0 1.207-.5V16a1 1 0 0 1 1-1h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-6a1 1 0 0 1-1-1V4.707a.707.707 0 0 0-1.207-.5l-6.94 6.94a1.207 1.207 0 0 0 0 1.707z"/></svg>
		</Button>
		<DropdownMenu>
			<DropdownMenuTrigger class={cn(buttonVariants(), "flex-3")}>
				{illegalDate.toDate(getLocalTimeZone()).toLocaleDateString('de-DE', {
					day: 'numeric',
					month: 'long',
					year: 'numeric'
				})}
			</DropdownMenuTrigger>
			<DropdownMenuContent align="center" class="w-auto">
				<Calendar type="single" bind:value={illegalDate} captionLayout="dropdown" isDateDisabled={(date) => {
					// Only 2026-04-01 and above
					if(date.year < 2026) return true;
					if(date.year === 2026 && date.month < 4) return true;
					if(date.year === 2026 && date.month === 4 && date.day < 1) return true;
					return date.compare(today(getLocalTimeZone()).subtract({ days: 1 })) > 0
				}} />
			</DropdownMenuContent>
		</DropdownMenu>
		<Button class="flex-1" onclick={() => {
			console.log("BEFORE: ", illegalDate.toString());
			illegalDate = illegalDate.add({ days: 1 });
			console.log("AFTER: ", illegalDate.toString());
		}} disabled={illegalDate.compare(today(getLocalTimeZone()).subtract({ days: 1 })) >= 0}>
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-big-right-icon lucide-arrow-big-right"><path d="M13.207 19.793a.707.707 0 0 1-1.207-.5V16a1 1 0 0 0-1-1H5a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h6a1 1 0 0 0 1-1V4.707a.707.707 0 0 1 1.207-.5l6.94 6.94a1.207 1.207 0 0 1 0 1.707z"/></svg>
		</Button>
	</div>