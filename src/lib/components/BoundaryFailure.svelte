<script lang="ts">
	import { dev } from '$app/environment';
	import * as Alert from '$lib/components/ui/alert';

	interface Props {
		error: unknown;
		reset: () => void;
	}

	const { error, reset }: Props = $props();

	let viewError = $state(dev);

	function toggleViewError() {
		viewError = !viewError;
	}
</script>

<div class="flex min-h-screen w-full items-center justify-center p-2">
	<Alert.Root variant="destructive" class="w-fit gap-y-2">
		<Alert.Title>Something went wrong.</Alert.Title>

		<Alert.Description class="space-y-2">
			<p>
				Try <button onclick={reset} class="underline">refreshing</button> the page. If the problem
				persists, please
				<a href="/feedback" class="underline" data-sveltekit-reload>contact us</a>.
			</p>

			<button class="text-muted-foreground text-xs underline" onclick={toggleViewError}>
				{viewError ? 'Hide' : 'Show'} error details
			</button>

			{#if viewError}
				<p class="font-mono wrap-break-word">
					{error instanceof Error ? error.message : String(error)}
				</p>
			{/if}
		</Alert.Description>
	</Alert.Root>
</div>
