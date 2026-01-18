<script lang="ts">
	import { getRelativeTime } from '$lib';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import { Badge } from '$lib/components/ui/badge';

	interface Props {
		lastRefresh: number;
		canRefresh: boolean;
		refresh: () => unknown;
	}
	let { lastRefresh, canRefresh, refresh }: Props = $props();
</script>

<Badge variant="secondary" class="text-tertiary-foreground mx-auto my-2 p-1 px-3 text-sm">
	<ClockIcon class="h-4 w-4" />
	Last updated {getRelativeTime(new Date(lastRefresh))}
	<button
		class={canRefresh ? 'cursor-pointer underline' : 'cursor-not-allowed'}
		onclick={refresh}
		disabled={!canRefresh}
	>
		Refresh
	</button>
</Badge>
