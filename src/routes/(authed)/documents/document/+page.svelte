<script lang="ts">
	import { page } from '$app/state';
	import { getBlobURLFromBase64String } from '$lib';
	import { acc } from '$lib/account.svelte';
	import { brand } from '$lib/brand';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import { Alert } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import type { ReportCard } from '$lib/types/ReportCard';
	import { onMount } from 'svelte';

	let reportCardURLPromise: Promise<string> | undefined = $state();

	const getReportCardURL = async (documentGU: string | null) => {
		if (documentGU === null) throw new Error('DocumentGU not provided');

		if (!acc.studentAccount) throw new Error('Student account not loaded');

		let reportCard: ReportCard;

		try {
			const result = await acc.studentAccount.reportCard(documentGU);
			if (!('Base64Code' in result)) throw new Error('Document not found');
			reportCard = result;
		} catch {
			throw new Error('Document not found');
		}

		return getBlobURLFromBase64String(reportCard.Base64Code);
	};

	onMount(async () => {
		reportCardURLPromise = getReportCardURL(page.url.searchParams.get('documentGU'));

		location.assign(await reportCardURLPromise);
	});
</script>

<svelte:head>
	<title>Document - {brand}</title>
</svelte:head>

{#if reportCardURLPromise}
	{#await reportCardURLPromise}
		<LoadingBanner>Loading document...</LoadingBanner>
	{:then}
		<LoadingBanner>Redirecting...</LoadingBanner>
	{:catch error}
		<div class="flex min-h-screen items-center justify-center">
			<Alert class="block w-fit space-y-2">
				<h1 class="text-lg">{error}</h1>
				<Button href="/documents" variant="outline">Return to Documents</Button>
			</Alert>
		</div>
	{/await}
{/if}
