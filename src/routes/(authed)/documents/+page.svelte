<script lang="ts">
	import { bgColorVariants } from '$lib';
	import { brand } from '$lib/brand';
	import DateBadge from '$lib/components/DateBadge.svelte';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import RefreshIndicator from '$lib/components/RefreshIndicator.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Tabs from '$lib/components/ui/tabs';
	import type { StudentDocumentData } from '$lib/types/Documents';
	import { documentsState, loadDocuments } from './documents.svelte';

	loadDocuments();

	function getDocumentColor(documentType: string) {
		switch (documentType) {
			case 'Report Card':
				return 'yellow';
			case 'Transcript':
				return 'red';
			case 'MAP Growth Family Report':
				return 'blue';
			default:
				return 'green';
		}
	}

	let documentDatas = $derived(
		documentsState.data?.StudentDocumentDatas?.StudentDocumentData ?? []
	);

	const sortPriority = ['Transcript', 'Report Card'];

	let documentCategories = $derived(
		new Set(
			documentDatas
				.map((documentData) => documentData._DocumentType)
				.toSorted((a, b) => {
					const aPriority = sortPriority.indexOf(a);
					const bPriority = sortPriority.indexOf(b);
					if (aPriority === -1 && bPriority === -1) return a.localeCompare(b);
					if (aPriority === -1) return 1;
					if (bPriority === -1) return -1;
					return aPriority - bPriority;
				})
		)
	);
</script>

<svelte:head>
	<title>Documents - {brand}</title>
</svelte:head>

{#if !documentsState.loaded}
	<LoadingBanner>Loading documents...</LoadingBanner>
{/if}

{#if documentsState.lastRefresh !== undefined}
	<RefreshIndicator
		canRefresh={documentsState.loaded}
		lastRefresh={documentsState.lastRefresh}
		refresh={() => loadDocuments(true)}
	/>
{/if}

{#if documentsState.data}
	<Tabs.Root value="all" class="mx-4 gap-4">
		<Tabs.List class="mx-auto h-12 max-w-full justify-start overflow-x-auto">
			<Tabs.Trigger value="all">All</Tabs.Trigger>

			{#each documentCategories as category (category)}
				<Tabs.Trigger value={category}>
					<div class={[bgColorVariants[getDocumentColor(category)], 'h-2 w-2 rounded-full']}></div>
					{category}
				</Tabs.Trigger>
			{/each}
		</Tabs.List>

		<Tabs.Content value="all">
			{@render documentsList(documentDatas)}
		</Tabs.Content>

		{#each documentCategories as category (category)}
			<Tabs.Content value={category}>
				{@render documentsList(
					documentDatas.filter((documentData) => documentData._DocumentType === category),
					false
				)}
			</Tabs.Content>
		{/each}
	</Tabs.Root>
{/if}

{#snippet documentsList(documents: StudentDocumentData[], showCategory = true)}
	<ol class="flex flex-col items-center gap-4">
		{#each documents as documentData (documentData._DocumentGU)}
			<li class="w-full max-w-3xl">
				<Button
					href="/documents/document?documentGU={documentData._DocumentGU}"
					target="_blank"
					variant="card"
					size="lg"
					class="flex h-auto flex-col items-start gap-2 rounded-xl p-4"
				>
					<h2 class="text-lg">{documentData._DocumentComment}</h2>
					<div class="flex flex-wrap gap-1">
						{#if showCategory}
							<Badge color={getDocumentColor(documentData._DocumentType)}>
								{documentData._DocumentType}
							</Badge>
						{/if}
						<DateBadge date={new Date(documentData._DocumentDate)} />
					</div>
				</Button>
			</li>
		{/each}
	</ol>
{/snippet}
