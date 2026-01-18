<script lang="ts">
	import { page } from '$app/state';
	import { getBlobURLFromBase64String } from '$lib';
	import { acc } from '$lib/account.svelte';
	import { brand } from '$lib/brand';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import { Alert } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import type { Attachment } from '$lib/types/Attachment';
	import { onMount } from 'svelte';

	let attachmentURLPromise: Promise<string> | undefined = $state();

	const getAttachmentURL = async (attachmentGU: string | null) => {
		if (attachmentGU === null) throw new Error('AttachmentGU not provided');

		if (!acc.studentAccount) throw new Error('Student account not loaded');

		let attachment: Attachment;

		try {
			attachment = await acc.studentAccount.attachment(attachmentGU);
		} catch {
			throw new Error('Attachment not found');
		}

		return getBlobURLFromBase64String(attachment.Base64Code);
	};

	onMount(async () => {
		attachmentURLPromise = getAttachmentURL(page.url.searchParams.get('attachmentGU'));

		location.assign(await attachmentURLPromise);
	});
</script>

<svelte:head>
	<title>Attachment - {brand}</title>
</svelte:head>

{#if attachmentURLPromise}
	{#await attachmentURLPromise}
		<LoadingBanner>Loading attachment...</LoadingBanner>
	{:then}
		<LoadingBanner>Redirecting...</LoadingBanner>
	{:catch error}
		<div class="flex min-h-screen items-center justify-center">
			<Alert class="block w-fit space-y-2">
				<h1 class="text-lg">{error}</h1>
				<Button href="/mail" variant="outline">Return to Mail</Button>
			</Alert>
		</div>
	{/await}
{/if}
