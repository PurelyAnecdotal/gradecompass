import { browser, dev } from '$app/environment';
import { env } from '$env/dynamic/public';
import type { ClientInit } from '@sveltejs/kit';
import { writable, type Writable } from 'svelte/store';

declare global {
	interface Window {
		msw?: typeof import('$lib/mocks/browser').worker;
	}
}


export const installPrompt: Writable<{ prompt?: () => Promise<UserChoice> }> = writable({});

interface UserChoice {
	outcome: 'accepted' | 'dismissed';
	platform: string;
}

interface BeforeInstallPromptEvent extends Event {
	platforms: string[];
	userChoice: Promise<UserChoice>;
	prompt: () => Promise<UserChoice>;
}

export const init: ClientInit = () => {
	addEventListener('beforeinstallprompt', (e) => {
		const event = e as BeforeInstallPromptEvent;

		event.preventDefault();
		installPrompt.set({ prompt: event.prompt.bind(event) });
	});
};

// https://github.com/mswjs/examples/blob/main/examples/with-svelte/src/hooks.client.ts
if (dev && browser && env.PUBLIC_DISABLE_MSW !== 'true') {
	const { worker } = await import('$lib/mocks/browser');

	// @ts-ignore
	window.msw = worker;

	await worker.start({
		onUnhandledRequest(request, print) {
			// Do not warn on unhandled internal Svelte requests.
			// Those are not meant to be mocked.
			if (request.url.includes('svelte')) return;

			if (new URL(request.url).origin !== env.PUBLIC_MOCK_STUDENTVUE_ORIGIN) return;

			print.warning();
		}
	});
}
