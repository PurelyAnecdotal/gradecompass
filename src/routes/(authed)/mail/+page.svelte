<script lang="ts">
	import { browser } from '$app/environment';
	import { brand } from '$lib/brand';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import RefreshIndicator from '$lib/components/RefreshIndicator.svelte';
	import type { InboxItemListingsMessageXML } from '$lib/types/MailData';
	import { SvelteSet } from 'svelte/reactivity';
	import MessageButton from './MessageButton.svelte';
	import MessageDialog from './MessageDialog.svelte';
	import { loadMailData, mailDataState } from './mailData.svelte';

	loadMailData();

	let domParser: DOMParser;
	if (browser) domParser = new DOMParser();

	let messageOpen = $state(false);
	let openedMessage: InboxItemListingsMessageXML | undefined = $state(undefined);
	let openedMessageContent = $state('');
	const openedMessageLinks: SvelteSet<string> = new SvelteSet();

	let touchscreen = $state(false);

	function openMessage(message: InboxItemListingsMessageXML) {
		openedMessage = message;

		const doc = domParser.parseFromString(message._MessageText, 'text/html');

		const links = doc.querySelectorAll('a');

		openedMessageLinks.clear();

		links.forEach((link) => {
			link.setAttribute('target', '_blank');

			if (new URL(link.href).hostname) openedMessageLinks.add(link.href);
		});

		openedMessageContent = doc.body.innerHTML;

		messageOpen = true;
	}
</script>

<svelte:head>
	<title>Mail - {brand}</title>
</svelte:head>

{#if !mailDataState.loaded}
	<LoadingBanner>Loading mail...</LoadingBanner>
{/if}

{#if mailDataState.lastRefresh !== undefined}
	<RefreshIndicator
		canRefresh={mailDataState.loaded}
		lastRefresh={mailDataState.lastRefresh}
		refresh={() => loadMailData(true)}
	/>
{/if}

{#if mailDataState.data}
	<ol class="m-4 flex flex-col items-center gap-4">
		{#each mailDataState.data.InboxItemListings.MessageXML as message (message._SMMessageGU)}
			<li
				class="w-full max-w-3xl"
				ontouchend={() => {
					touchscreen = true;
				}}
			>
				<MessageButton {message} onclick={() => openMessage(message)} />
			</li>
		{/each}
	</ol>

	{#if openedMessage}
		<MessageDialog
			bind:open={messageOpen}
			message={openedMessage}
			content={openedMessageContent}
			links={openedMessageLinks}
			{touchscreen}
		/>
	{/if}
{/if}
