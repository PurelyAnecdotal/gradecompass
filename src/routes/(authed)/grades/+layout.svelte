<script lang="ts">
	import BoundaryFailure from '$lib/components/BoundaryFailure.svelte';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import RefreshIndicator from '$lib/components/RefreshIndicator.svelte';
	import * as Alert from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import * as Item from '$lib/components/ui/item';
	import {
		getCurrentGradebookState,
		gradebooksState,
		loadGradebooks,
		showGradebook
	} from '$lib/grades/gradebook.svelte';
	import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';
	import HistoryIcon from '@lucide/svelte/icons/history';

	let { children } = $props();

	const currentGradebookState = $derived(getCurrentGradebookState(gradebooksState));

	const defaultReportingPeriodName = $derived(
		gradebooksState.records && gradebooksState.activeIndex !== undefined
			? gradebooksState.records[gradebooksState.activeIndex]?.data?.ReportingPeriod._GradePeriod
			: undefined
	);

	let loadingError: unknown = $state(undefined);

	loadGradebooks().catch((error) => {
		console.error('Error loading gradebooks:', error);
		loadingError = error;
	});

	function resetReportPeriodOverride() {
		showGradebook();
	}
</script>

{#if !currentGradebookState?.loaded && loadingError === undefined}
	<LoadingBanner>Loading grades...</LoadingBanner>
{/if}

{#if currentGradebookState?.lastRefresh !== undefined}
	<RefreshIndicator
		canRefresh={currentGradebookState.loaded}
		lastRefresh={currentGradebookState.lastRefresh}
		refresh={() =>
			showGradebook(gradebooksState.overrideIndex ?? gradebooksState.activeIndex, true)}
	/>
{/if}

{#if loadingError !== undefined}
	<Alert.Root variant="destructive" class="mx-auto w-fit min-w-sm">
		<AlertCircleIcon />
		<Alert.Title>An error occurred while loading grades.</Alert.Title>
		<Alert.Description>
			{loadingError instanceof Error ? loadingError.message : String(loadingError)}
		</Alert.Description>
	</Alert.Root>
{/if}

{#if gradebooksState.overrideIndex !== undefined && gradebooksState.records && gradebooksState.activeIndex !== undefined && currentGradebookState?.data}
	<div class="m-4 flex justify-center">
		<Item.Root variant="outline" size="sm" class="w-full max-w-3xl">
			<Item.Media>
				<HistoryIcon class="size-5" />
			</Item.Media>

			<Item.Content>
				<Item.Title class="whitespace-nowrap">
					<span>
						Viewing grades from
						<span class="font-bold">{currentGradebookState.data.ReportingPeriod._GradePeriod}</span>
					</span>
				</Item.Title>
			</Item.Content>

			<Item.Actions>
				<Button onclick={resetReportPeriodOverride} variant="outline">
					Return to {defaultReportingPeriodName}
				</Button>
			</Item.Actions>
		</Item.Root>
	</div>
{/if}

<svelte:boundary>
	{@render children()}

	{#snippet failed(error, reset)}
		<BoundaryFailure {error} {reset} />
	{/snippet}
</svelte:boundary>
