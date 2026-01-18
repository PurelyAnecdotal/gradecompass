<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { LocalStorageKey } from '$lib';
	import { acc, loadStudentAccount } from '$lib/account.svelte';
	import { brand } from '$lib/brand';
	import Disclaimer from '$lib/components/Disclaimer.svelte';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import * as Alert from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { StudentAccount } from '$lib/synergy';
	import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';
	import LogInIcon from '@lucide/svelte/icons/log-in';
	import { fly } from 'svelte/transition';

	if (browser && localStorage.getItem(LocalStorageKey.token) !== null) {
		if (!acc.studentAccount) loadStudentAccount();

		void goto('/grades');
	}

	let username: string = $state('');
	let password: string = $state('');
	let domain: string = $state('');

	let loginError: string | undefined = $state();

	let loggingIn = $state(false);

	async function login(event: SubmitEvent) {
		event.preventDefault();

		if (loggingIn) return;
		loggingIn = true;

		const loginAccount = new StudentAccount(domain, username, password);

		try {
			await loginAccount.checkLogin();
		} catch (e) {
			loggingIn = false;

			loginError = e instanceof Error ? e.message : 'An unknown error occurred';
			return;
		}

		acc.studentAccount = loginAccount;

		localStorage.setItem(LocalStorageKey.token, JSON.stringify({ username, password, domain }));

		loggingIn = false;

		void goto('/grades');
	}

	let pastedUrl = $state('');
	const convertedDomain = $derived.by(() => {
		try {
			const url = new URL(pastedUrl);
			return url.host;
		} catch {
			return undefined;
		}
	});

	function findDomain() {
		if (convertedDomain === undefined) return;
		domain = convertedDomain;
		domainDialogOpen = false;
	}
	let domainDialogOpen = $state(false);
</script>

<svelte:head>
	<title>Log In - {brand}</title>
</svelte:head>

{#if loggingIn}
	<LoadingBanner>Logging you in...</LoadingBanner>
{/if}

{#if loginError}
	<div in:fly={{ y: -50, duration: 200 }} class="fixed top-0 left-0 flex w-full justify-center p-4">
		<Alert.Root variant="destructive" class="w-fit">
			<AlertCircleIcon />
			<Alert.Title>Couldn't log in</Alert.Title>
			<Alert.Description>{loginError}</Alert.Description>
		</Alert.Root>
	</div>
{/if}

<div class="flex min-h-screen flex-col">
	<main class="flex grow items-center justify-center">
		<form onsubmit={login} class="m-4 flex w-full max-w-sm flex-col gap-4">
			<div class="mb-8 flex flex-col items-center gap-2">
				<img src="/favicon.svg" class="h-8 w-8" alt={brand} />

				<h1 class="text-xl font-bold">Log in to {brand}</h1>

				<Field.Description>
					Never used {brand} before? <a href="/signup">Sign up</a>
				</Field.Description>
			</div>

			<Field.Group>
				<Field.Field>
					<Field.Label for="username">StudentVUE Username</Field.Label>
					<Input
						id="username"
						type="text"
						bind:value={username}
						placeholder="student@school.net"
						autocomplete="username"
						required
					/>
				</Field.Field>

				<Field.Field>
					<Field.Label for="password">StudentVUE Password</Field.Label>
					<Input
						type="password"
						id="password"
						bind:value={password}
						autocomplete="current-password"
						required
					/>
					<Field.Description>
						Your device connects directly to StudentVUE. We can't see your password or your grades.
					</Field.Description>
				</Field.Field>

				<Field.Field>
					<div class="flex items-center">
						<Field.Label for="domain">StudentVUE Domain</Field.Label>

						<Dialog.Root bind:open={domainDialogOpen}>
							<Dialog.Trigger
								class="text-tertiary-foreground ms-auto inline-block text-sm underline"
								form="none"
							>
								Help me find my domain
							</Dialog.Trigger>

							<Dialog.Content>
								<form onsubmit={findDomain} class="space-y-4">
									<Label for="pastedUrl">
										Paste any link to your district's StudentVUE website
									</Label>

									<div class="flex gap-2">
										<Input
											id="pastedUrl"
											type="url"
											placeholder="https://[your-district]-psv.edupoint.com/Home_PXP2.aspx"
											bind:value={pastedUrl}
											required
										/>
										<Button type="submit" disabled={convertedDomain === undefined}>Submit</Button>
									</div>
								</form>
							</Dialog.Content>
						</Dialog.Root>
					</div>

					<Input
						type="text"
						id="domain"
						placeholder="[your-district]-psv.edupoint.com"
						autocomplete="on"
						autocorrect="off"
						bind:value={domain}
						required
					/>
				</Field.Field>

				<Field.Field orientation="horizontal" class="items-center">
					<Checkbox name="disclaimer" id="disclaimer" required />

					<Field.Label for="disclaimer" class="text-tertiary-foreground text-xs">
						I understand that {brand} is an independent, unofficial tool and is not affiliated with or
						endorsed by Edupoint Educational Systems LLC. Use of StudentVUE is subject to Edupoint Educational
						Systems LLC's terms of service, and I am responsible for ensuring my use complies with those
						terms.
					</Field.Label>
				</Field.Field>

				<Field.Field>
					<Button type="submit" class="w-full">
						<LogInIcon class="h-4 w-4" /> Log in
					</Button>
				</Field.Field>
			</Field.Group>
		</form>
	</main>

	<Disclaimer />
</div>
