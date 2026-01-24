<script lang="ts">
	import { browser } from '$app/environment';
	import { brand, contactEmail } from '$lib/brand';
	import Disclaimer from '$lib/components/Disclaimer.svelte';
	import * as Card from '$lib/components/ui/card';

	let email = $state('[email protected]');
	if (browser) email = contactEmail;
</script>

<svelte:head>
	<title>Privacy - {brand}</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center">
	<main class="flex grow items-center">
		<Card.Root class="m-4 max-w-xl">
			<Card.Header>
				<Card.Title>About the privacy of {brand}</Card.Title>
			</Card.Header>

			<Card.Content class="text-tertiary-foreground space-y-4">
				<p>
					{brand} is designed to keep students' information private.
				</p>

				<p>
					When a student uses the {brand} interface, their own device transmits their username and password
					directly to the official student portal, which returns their student information directly to
					their device.
				</p>

				<p>
					{brand} servers do not receive any student data or login information. The GradeCompass interface
					is purely client-side: all data is retrieved, processed, and stored on-device.
				</p>

				<p>
					If you have questions or concerns about {brand}, you can contact us at
					<a href="mailto:{email}" class="underline">{email}</a>.
				</p>
			</Card.Content>
		</Card.Root>
	</main>

	<Disclaimer />
</div>
