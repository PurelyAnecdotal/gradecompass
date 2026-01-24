<script lang="ts">
	import { removeCourseType } from '$lib';
	import { brand } from '$lib/brand';
	import { buttonVariants } from '$lib/components/ui/button';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Spinner } from '$lib/components/ui/spinner';
	import { initializeGradebookCatalog } from '$lib/grades/catalog.svelte';
	import { getActiveGradebook } from '$lib/grades/gradebook';
	import AppWindowMacIcon from '@lucide/svelte/icons/app-window-mac';
	import BellIcon from '@lucide/svelte/icons/bell';
	import CircleUserIcon from '@lucide/svelte/icons/circle-user';
	import EllipsisVerticalIcon from '@lucide/svelte/icons/ellipsis-vertical';
	import FolderOpenIcon from '@lucide/svelte/icons/folder-open';
	import InboxIcon from '@lucide/svelte/icons/inbox';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import MessageSquareWarningIcon from '@lucide/svelte/icons/message-square-warning';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import NotebookTextIcon from '@lucide/svelte/icons/notebook-text';
	import SunIcon from '@lucide/svelte/icons/sun';
	import { mode, toggleMode } from 'mode-watcher';
	import { onMount, type Component } from 'svelte';
	import { fade } from 'svelte/transition';
	import { installPrompt } from '../../hooks.client';
	import { loadStudentInfo, studentInfoState } from './studentinfo/studentInfo.svelte';

	function logOut() {
		localStorage.clear();
		location.assign('/login');
	}

	const courses = $derived(getActiveGradebook()?.Courses.Course);

	function installWebApp() {
		$installPrompt.prompt?.();
	}

	loadStudentInfo();

	const data = {
		grades: {
			title: 'Grades',
			url: '/grades',
			icon: NotebookTextIcon
		},
		header: [
			{
				title: 'Attendance',
				url: '/attendance',
				icon: BellIcon
			},
			{
				title: 'Documents',
				url: '/documents',
				icon: FolderOpenIcon
			},
			{
				title: 'Mail',
				url: '/mail',
				icon: InboxIcon
			}
		],
		pwa: {
			title: 'Install Web App',
			icon: AppWindowMacIcon,
			onclick: installWebApp
		},
		feedback: {
			title: 'Feedback',
			url: '/feedback',
			icon: MessageSquareWarningIcon
		},
		user: {
			title: studentInfoState.data?.FormattedName ?? 'Student Info',
			url: '/studentinfo',
			icon: CircleUserIcon
		},
		logout: {
			title: 'Log Out',
			onclick: logOut,
			icon: LogOutIcon
		}
	};

	onMount(() => {
		initializeGradebookCatalog();
	});
</script>

{#snippet menuItem({
	title,
	url,
	onclick,
	icon: Icon
}: {
	title: string;
	url?: string;
	onclick?: () => void;
	icon: Component;
})}
	<Sidebar.MenuItem>
		<Sidebar.MenuButton class="h-10 text-base">
			{#snippet child({ props })}
				{#if url}
					<a href={url} {...props}>
						<Icon /> <span>{title}</span>
					</a>
				{:else}
					<button {onclick} {...props}>
						<Icon /> <span>{title}</span>
					</button>
				{/if}
			{/snippet}
		</Sidebar.MenuButton>
	</Sidebar.MenuItem>
{/snippet}

<Sidebar.Root>
	<Sidebar.Header>
		<Sidebar.MenuItem>
			<div class="m-2 flex flex-row items-center">
				<img src="/favicon.svg" class="size-6" alt={brand} />
				<span class="ml-2 text-lg font-bold tracking-tight">{brand}</span>
			</div>
		</Sidebar.MenuItem>
	</Sidebar.Header>

	<Sidebar.Content>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton class="h-10 text-base">
					{#snippet child({ props })}
						<a href={data.grades.url} {...props}>
							<data.grades.icon /> <span>{data.grades.title}</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>

				<svelte:boundary>
					{#if courses}
						<Sidebar.MenuSub>
							{#each courses as Course, index (Course._CourseID)}
								<Sidebar.MenuSubItem>
									<Sidebar.MenuSubButton class="h-8 truncate text-base">
										{#snippet child({ props })}
											<a href={`${data.grades.url}/${index.toString()}`} {...props}>
												{removeCourseType(Course._CourseName)}
											</a>
										{/snippet}
									</Sidebar.MenuSubButton>
								</Sidebar.MenuSubItem>
							{/each}
						</Sidebar.MenuSub>
					{/if}

					{#snippet pending()}
						<Sidebar.MenuSub>
							<div class="flex w-full items-center justify-center p-4">
								<Spinner />
							</div>
						</Sidebar.MenuSub>
					{/snippet}
				</svelte:boundary>
			</Sidebar.MenuItem>

			{#each data.header as item (item.title)}
				{@render menuItem(item)}
			{/each}
		</Sidebar.Menu>

		<Sidebar.MenuItem class="mt-auto mx-2">
			<Button
				href="/privacy"
				variant="ghost"
				class="text-muted-foreground h-auto border py-3 text-xs whitespace-normal"
			>
				Your password and grades are private and stored on-device.
			</Button>
		</Sidebar.MenuItem>
	</Sidebar.Content>

	<Sidebar.Footer>
		<Sidebar.Menu class="gap-2">
			{#if $installPrompt.prompt}
				<div transition:fade>
					{@render menuItem(data.pwa)}
				</div>
			{/if}

			{@render menuItem(data.feedback)}

			<Sidebar.MenuItem>
				<Sidebar.MenuButton class="h-10 text-base">
					{#snippet child({ props })}
						<div class="flex items-center gap-1">
							<a href={data.user.url} {...props}>
								<data.user.icon /> <span>{data.user.title}</span>
							</a>

							<DropdownMenu.Root>
								<DropdownMenu.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon-lg' })}>
									<EllipsisVerticalIcon />
								</DropdownMenu.Trigger>

								<DropdownMenu.Content>
									<DropdownMenu.Item onclick={toggleMode} class="h-9">
										<MoonIcon
											class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
										/>
										<SunIcon
											class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
										/>
										{mode.current === 'light' ? 'Dark Mode' : 'Light Mode'}
									</DropdownMenu.Item>

									<DropdownMenu.Item onclick={data.logout.onclick} class="h-9">
										<data.logout.icon />
										{data.logout.title}
									</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						</div>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
</Sidebar.Root>
