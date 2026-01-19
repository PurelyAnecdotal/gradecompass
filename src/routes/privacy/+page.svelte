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

			<Card.Content class="space-y-4">
				<p>
					{brand} is designed to keep students' information private the entire time they use the service.
				</p>

				<p>
					When a student uses {brand}, their own device sends their username and password directly
					to the offical student portal, and the portal returns their student information directly
					to their device. {brand} servers do not receive or process any student information. All student
					information is stored and processed on-device.
				</p>

				<p>
					If you have questions or concerns about {brand}, please contact us at
					<a href="mailto:{email}" class="underline">{email}</a>.
				</p>
			</Card.Content>
		</Card.Root>
	</main>

	<Disclaimer />
</div>
