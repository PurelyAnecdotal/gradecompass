<script lang="ts">
	import * as Item from '$lib/components/ui/item';
	import { Spinner } from '$lib/components/ui/spinner';
	import NumberFlow from '@number-flow/svelte';
	import { onMount } from 'svelte';

	interface Props {
		loadingReportPeriodName?: string;
		status: string;
	}
	let { loadingReportPeriodName, status }: Props = $props();

	let stopwatch = $state(0);
	onMount(() => {
		const interval = setInterval(() => {
			stopwatch += 1;
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<Item.Root variant="muted" size="sm" class="bg-muted/90 fixed top-6 z-10">
	<Item.Media><Spinner /></Item.Media>

	<Item.Content>
		<Item.Title>
			Loading {loadingReportPeriodName} grades...
		</Item.Title>

		<Item.Description>
			{status}
			<NumberFlow value={stopwatch} suffix="s" />
		</Item.Description>
	</Item.Content>
</Item.Root>
