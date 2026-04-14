<script lang="ts" module>
	/* eslint-disable svelte/no-navigation-without-resolve */
	interface Nav {
		navMain: {
			title: string;
			url: string;
			items?: {
				title: string;
				url: string;
				isActive?: boolean;
			}[];
		}[];
	}

	const data: Nav = {
		navMain: [
			{
				title: "Statistiken",
				url: "#",
				items: [
					{
						title: "Preise",
						url: "#prices",
					},
					{
						title: "Historie",
						url: "#history",
					},
					{
						title: "Statistiken",
						url: "#statistics",
					},
					{
						title: "Illegale Preiserhöhungen",
						url: "#violations",
					},
					{
						title: "Tankstellen",
						url: "#stations",
					},
				],
			},
		],
	};
</script>

<script lang="ts">
	import { browser } from "$app/environment";

	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { CalendarIcon, DatabaseIcon } from "@lucide/svelte";
	import type { ComponentProps } from "svelte";
	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root {...restProps} bind:ref>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<div {...props}>
							<div
								class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
							>
								<CalendarIcon class="size-4" />
							</div>
							<div class="flex flex-col gap-0.5 leading-none">
								<span class="font-medium">Letzte Aktualisierung</span>
								<span>
									{#if browser}
										{#await fetch("/fuel/api/data").then((res) => res.json()) then data}
											{new Date(data.lastUpdate).toLocaleString("de-DE", {
												timeZone: "UTC",
												dateStyle: "medium",
												timeStyle: "short",
											})}
										{/await}
									{/if}
								</span>
							</div>
						</div>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<div {...props}>
							<div
								class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
							>
								<DatabaseIcon class="size-4" />
							</div>
							<div class="flex flex-col gap-0.5 leading-none">
								<span class="font-medium">Datengröße</span>
								<span>
									{#if browser}
										{#await fetch("/fuel/api/data").then((res) => res.json()) then data}
											{data.diskSize}
										{/await}
									{/if}
								</span>
							</div>
						</div>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.Menu>
				{#each data.navMain as item (item.title)}
					<Sidebar.MenuItem>
						<Sidebar.MenuButton class="font-medium">
							{#snippet child({ props })}
								<a href={item.url} {...props}>
									{item.title}
								</a>
							{/snippet}
						</Sidebar.MenuButton>
						{#if item.items?.length}
							<Sidebar.MenuSub>
								{#each item.items as subItem (subItem.title)}
									<Sidebar.MenuSubItem>
										<Sidebar.MenuSubButton isActive={subItem.isActive}>
											{#snippet child({ props })}
												<a href={subItem.url} {...props}>{subItem.title}</a>
											{/snippet}
										</Sidebar.MenuSubButton>
									</Sidebar.MenuSubItem>
								{/each}
							</Sidebar.MenuSub>
						{/if}
					</Sidebar.MenuItem>
				{/each}
			</Sidebar.Menu>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
