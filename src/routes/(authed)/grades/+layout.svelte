<script lang="ts">
	import BoundaryFailure from '$lib/components/BoundaryFailure.svelte';
	import RefreshIndicator from '$lib/components/RefreshIndicator.svelte';
	import * as Alert from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import * as Item from '$lib/components/ui/item';
	import {
		getActiveGradebookRecord,
		getDefaultGradebookRecord,
		getReportPeriodName,
		gradebookState,
		initializeGradebookCatalog,
		switchReportPeriod
	} from '$lib/grades/catalog.svelte';
	import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';
	import HistoryIcon from '@lucide/svelte/icons/history';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import GradebookLoadingBanner from './GradebookLoadingBanner.svelte';

	let { children } = $props();

	const loadingError = $derived(gradebookState.loadingError);

	const gradebookCatalog = $derived(gradebookState.gradebookCatalog);

	const loadingIndex = $derived(gradebookCatalog?.loadingIndex);

	const gradebookRecord = $derived(getActiveGradebookRecord());

	const defaultReportPeriodName = $derived(
		getDefaultGradebookRecord()?.data?.ReportingPeriod._GradePeriod
	);

	const activeReportPeriodName = $derived(gradebookRecord?.data?.ReportingPeriod._GradePeriod);

	const loadingReportPeriodName = $derived(
		loadingIndex !== undefined ? getReportPeriodName(loadingIndex) : undefined
	);

	function resetReportPeriodOverride() {
		switchReportPeriod();
	}

	function refreshGradebook() {
		switchReportPeriod({
			overrideIndex: gradebookCatalog?.overrideIndex,
			forceRefresh: true
		});
	}

	onMount(() => {
		initializeGradebookCatalog();
	});
</script>

{#if (!gradebookCatalog || loadingIndex !== undefined) && loadingError === undefined}
	<div class="flex justify-center" in:fade out:fly={{ y: '-50%' }}>
		{#key gradebookCatalog?.receivingData}
			<GradebookLoadingBanner
				{loadingReportPeriodName}
				status={gradebookCatalog?.receivingData ? 'Receiving' : 'Pending'}
			/>
		{/key}
	</div>
{/if}

{#if gradebookRecord?.lastRefresh !== undefined}
	<RefreshIndicator
		canRefresh={loadingIndex === undefined}
		lastRefresh={gradebookRecord.lastRefresh}
		refresh={refreshGradebook}
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

{#if gradebookCatalog?.overrideIndex !== undefined}
	<div class="m-4 flex justify-center">
		<Item.Root variant="outline" size="sm" class="w-full max-w-3xl">
			<Item.Media>
				<HistoryIcon class="size-5" />
			</Item.Media>

			<Item.Content>
				<Item.Title class="whitespace-nowrap">
					<span>Viewing grades from <span class="font-bold">{activeReportPeriodName}</span></span>
				</Item.Title>
			</Item.Content>

			<Item.Actions>
				<Button onclick={resetReportPeriodOverride} variant="outline">
					Return to {defaultReportPeriodName}
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
