<script lang="ts">
	import { brand } from '$lib/brand';
	import Disclaimer from '$lib/components/Disclaimer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>Sign Up - {brand}</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center">
	<main class="flex grow items-center">
		{@render children()}
	</main>

	<Disclaimer />
</div>
