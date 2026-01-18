<script lang="ts">
	import { LocalStorageKey } from '$lib';
	import { acc } from '$lib/account.svelte';
	import { brand } from '$lib/brand';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import RefreshIndicator from '$lib/components/RefreshIndicator.svelte';
	import * as Accordion from '$lib/components/ui/accordion';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import { loadStudentInfo, studentInfoState } from './studentInfo.svelte';

	loadStudentInfo();

	const dataSources = Object.values(LocalStorageKey);

	async function copy(key: string) {
		const data = localStorage.getItem(key);
		if (data === null) {
			alert('Not found');
			return;
		}

		await navigator.clipboard.writeText(data);
	}

	async function paste(key: string) {
		const text = await navigator.clipboard.readText();

		try {
			JSON.parse(text);
		} catch {
			alert('Invalid JSON');
			return;
		}

		localStorage.setItem(key, text);
	}

	const remove = (key: string) => localStorage.removeItem(key);

	let showPassword = $state(false);
	function togglePassword() {
		showPassword = !showPassword;
	}

	function copyUsername() {
		if (!acc.studentAccount) return;
		navigator.clipboard.writeText(acc.studentAccount.userID);
	}
	function copyPassword() {
		if (!acc.studentAccount) return;
		navigator.clipboard.writeText(acc.studentAccount.password);
	}
	function copyDomain() {
		if (!acc.studentAccount) return;
		navigator.clipboard.writeText(acc.studentAccount.domain);
	}
</script>

<svelte:head>
	<title>Student Info - {brand}</title>
</svelte:head>

{#if !studentInfoState.loaded}
	<LoadingBanner>Loading student info...</LoadingBanner>
{/if}

{#if studentInfoState.lastRefresh !== undefined}
	<RefreshIndicator
		canRefresh={studentInfoState.loaded}
		lastRefresh={studentInfoState.lastRefresh}
		refresh={() => loadStudentInfo(true)}
	/>
{/if}

<div class="m-4 flex flex-wrap justify-center gap-4">
	{#if studentInfoState.data}
		<Card.Root class="w-sm max-w-full">
			<Card.Header>
				<Card.Title>Student Information</Card.Title>
			</Card.Header>

			<Card.Content class="flex h-full items-center justify-between gap-6">
				<div class="space-y-2">
					<p>{studentInfoState.data.FormattedName}</p>
					<p class="text-muted-foreground">{studentInfoState.data.PermID}</p>
					<p class="text-muted-foreground">Grade {studentInfoState.data.Grade}</p>
					<p class="text-muted-foreground">{studentInfoState.data.Gender}</p>
				</div>

				<img
					src="data:image/png;base64,{studentInfoState.data.Photo}"
					class="h-full rounded-sm"
					alt="Student Portrait"
				/>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if acc.studentAccount}
		<Card.Root class="w-sm max-w-full">
			<Card.Header>
				<Card.Title>Login Information</Card.Title>
				<Card.Description>Stored on-device</Card.Description>
			</Card.Header>

			<Card.Content>
				<dl>
					<dt>Username</dt>
					<dd class="flex items-center justify-end gap-2">
						{acc.studentAccount.userID}
						<Button onclick={copyUsername} variant="outline" size="icon-sm" title="Copy username">
							<CopyIcon />
						</Button>
					</dd>
					<dt>Password</dt>
					<dd class="flex items-center justify-end gap-2">
						<span class="{showPassword ? '' : 'blur select-none'} transition-all">
							{#if showPassword}
								{acc.studentAccount.password}
							{:else}
								#Wa5$^yB%4R#6K^C
							{/if}
						</span>
						{#if !showPassword}
							<Button
								onclick={togglePassword}
								variant="outline"
								size="icon-sm"
								title="Show password"
							>
								<EyeIcon />
							</Button>
						{/if}
						<Button onclick={copyPassword} variant="outline" size="icon-sm" title="Copy password">
							<CopyIcon />
						</Button>
					</dd>
					<dt>Domain</dt>
					<dd class="flex items-center justify-end gap-2">
						{acc.studentAccount.domain}
						<Button onclick={copyDomain} variant="outline" size="icon-sm" title="Copy domain">
							<CopyIcon />
						</Button>
					</dd>
				</dl>
			</Card.Content>
		</Card.Root>
	{/if}
</div>

<Accordion.Root type="single" class="mx-auto w-fit">
	<Accordion.Item>
		<Accordion.Trigger>Developer Tools</Accordion.Trigger>

		<Accordion.Content>
			<Table.Root>
				<Table.Body>
					{#each dataSources as dataSource (dataSource)}
						<Table.Row>
							<Table.Cell>{dataSource}</Table.Cell>
							{@render toolButton('Copy', () => void copy(dataSource))}
							{@render toolButton('Paste', () => void paste(dataSource))}
							{@render toolButton('Delete', () => remove(dataSource))}
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>

{#snippet toolButton(name: string, func: () => void)}
	<Table.Cell>
		<Button variant="outline" onclick={func}>{name}</Button>
	</Table.Cell>
{/snippet}
