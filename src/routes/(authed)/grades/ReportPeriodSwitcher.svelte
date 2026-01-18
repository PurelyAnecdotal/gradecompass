<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import type { ReportPeriod } from '$lib/types/Gradebook';
	import CloudCheckIcon from '@lucide/svelte/icons/cloud-check';
	import HourglassIcon from '@lucide/svelte/icons/hourglass';

	interface Props {
		activeName: string;
		activeIndex: number;
		reportPeriods: ReportPeriod[];
		switchReportPeriod: (index: number) => void;
		hasReportPeriodCached?: (index: number) => boolean;
		disabled?: boolean;
		defaultIndex?: number;
	}
	let {
		activeName,
		activeIndex,
		reportPeriods,
		hasReportPeriodCached,
		switchReportPeriod,
		disabled = false,
		defaultIndex
	}: Props = $props();
</script>

<Select.Root
	type="single"
	bind:value={() => activeIndex.toString(), (value) => switchReportPeriod(parseInt(value))}
	{disabled}
>
	<Select.Trigger class="mx-auto">
		{activeName}
	</Select.Trigger>

	<Select.Content>
		<Select.Group>
			<Select.Label>Report Periods</Select.Label>

			{#each reportPeriods as reportPeriod, index (reportPeriod._Index)}
				<Select.Item value={index.toString()} label={reportPeriod._GradePeriod}>
					{reportPeriod._GradePeriod}
					{#if hasReportPeriodCached?.(index)}
						<CloudCheckIcon />
					{/if}
					{#if index === defaultIndex}
						<HourglassIcon />
					{/if}
				</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
</Select.Root>
