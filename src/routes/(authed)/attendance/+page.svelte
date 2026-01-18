<script lang="ts">
	import { fullDateFormatter, removeCourseType } from '$lib';
	import { brand } from '$lib/brand';
	import LoadingBanner from '$lib/components/LoadingBanner.svelte';
	import RefreshIndicator from '$lib/components/RefreshIndicator.svelte';
	import * as Accordion from '$lib/components/ui/accordion';
	import { Alert } from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import type { Period } from '$lib/types/Attendance';
	import CircleCheckIcon from '@lucide/svelte/icons/circle-check';
	import { attendanceState, loadAttendance } from './attendance.svelte';

	loadAttendance();

	const excusedReasonRegex =
		/Field Trip|School Pass|Excused|Medical\/Dent|Comp Ed\/Court-Religi|Illness or Sickness|SB14 Wellness\/Illnes|Med. all day\/period/;

	function getAbsenceType(periods: Period[]) {
		const reasons = periods.map((period: Period) => period._Name);

		if (reasons.some((reason) => reason === 'Absent' || reason === 'Non ADA')) return 'Absent';

		if (reasons.some((reason) => /Tardy/.test(reason))) return 'Tardy';

		if (reasons.some((reason) => excusedReasonRegex.test(reason))) return 'Excused';

		if (reasons.some((reason) => reason === 'Present')) return 'Present';

		return 'Unknown';
	}

	function getAbsenceColor(absenceType: string) {
		switch (absenceType) {
			case 'Absent':
				return 'red';
			case 'Tardy':
				return 'yellow';
			case 'Excused':
			case 'Present':
				return 'green';
			default:
				return 'orange';
		}
	}
</script>

<svelte:head>
	<title>Attendance - {brand}</title>
</svelte:head>

{#if !attendanceState.loaded}
	<LoadingBanner>Loading attendance...</LoadingBanner>
{/if}

{#if attendanceState.lastRefresh !== undefined}
	<RefreshIndicator
		canRefresh={attendanceState.loaded}
		lastRefresh={attendanceState.lastRefresh}
		refresh={() => loadAttendance(true)}
	/>
{/if}

{#if attendanceState.data && attendanceState.data.Absences.Absence}
	<div class="mx-2 mt-8 md:mx-4">
		{#if attendanceState.data.Absences.Absence?.length > 0}
			<Accordion.Root type="single" class="mx-auto max-w-2xl">
				{#each attendanceState.data.Absences.Absence as absence (absence._AbsenceDate)}
					<Accordion.Item>
						<Accordion.Trigger>
							{fullDateFormatter.format(new Date(absence._AbsenceDate))}{#if absence._Note}
								: {absence._Note}
							{/if}

							{#if getAbsenceType(absence.Periods.Period ?? [])}
								<Badge
									color={getAbsenceColor(getAbsenceType(absence.Periods.Period ?? []) ?? 'unknown')}
									class="ml-auto"
								>
									{getAbsenceType(absence.Periods.Period ?? [])}
								</Badge>
							{/if}
						</Accordion.Trigger>

						<Accordion.Content>
							<ol class="text-muted-foreground space-y-2">
								{#each absence.Periods.Period?.filter((course) => course._Name) ?? [] as period (period._Course)}
									<li>{removeCourseType(period._Course)}: {period._Name}</li>
								{/each}
							</ol>
						</Accordion.Content>
					</Accordion.Item>
				{/each}
			</Accordion.Root>
		{:else}
			<Alert class="mx-auto w-fit">
				<CircleCheckIcon /> Looks like you haven't had any attendence events yet.
			</Alert>
		{/if}
	</div>
{/if}
