<script lang="ts">
	import { removeCourseType } from '$lib';
	import { brand } from '$lib/brand';
	import * as Alert from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { parseSynergyAssignment } from '$lib/grades/assignments';
	import {
		getCurrentGradebookState,
		getPeriodIndex,
		gradebooksState,
		seenAssignmentIDs,
		showGradebook
	} from '$lib/grades/gradebook.svelte';
	import type { Course } from '$lib/types/Gradebook';
	import CircleXIcon from '@lucide/svelte/icons/circle-x';
	import CourseButton from './CourseButton.svelte';

	const currentGradebookState = $derived(getCurrentGradebookState(gradebooksState));

	const allPeriods = $derived(currentGradebookState?.data?.ReportingPeriods.ReportPeriod);

	const currentPeriod = $derived(currentGradebookState?.data?.ReportingPeriod);

	const currentPeriodIndex = $derived(
		currentPeriod && allPeriods ? getPeriodIndex(currentPeriod, allPeriods) : undefined
	);

	$effect(() => {
		if (currentPeriodIndex === -1)
			throw new Error('Could not find index of current reporting period');
	});

	function getCourseUnseenAssignmentsCount(course: Course) {
		if (course.Marks === '') return 0;

		const assignments = course.Marks.Mark.Assignments.Assignment;
		if (!assignments) return 0;

		return assignments.map(parseSynergyAssignment).filter(({ id }) => !seenAssignmentIDs.has(id))
			.length;
	}

	function getCourseGrade(course: Course) {
		if (course.Marks === '') return;

		return {
			letter: course.Marks.Mark._CalculatedScoreString,
			percentage: parseFloat(course.Marks.Mark._CalculatedScoreRaw)
		};
	}

	const hasNoGrades = $derived(
		currentGradebookState?.data
			? currentGradebookState.data.Courses.Course.map((course) =>
					course.Marks === '' ? 'N/A' : course.Marks.Mark._CalculatedScoreString
				).every((score) => score === 'N/A')
			: false
	);

	const totalUnseenAssignments = $derived.by(() => {
		if (!currentGradebookState?.data) return 0;

		return currentGradebookState.data.Courses.Course.reduce((total, course) => {
			return total + getCourseUnseenAssignmentsCount(course);
		}, 0);
	});

	function clearAllUnseenAssignments() {
		if (!currentGradebookState?.data) return;

		currentGradebookState.data.Courses.Course.forEach((course) => {
			if (course.Marks === '') return;
			const assignments = course.Marks.Mark.Assignments.Assignment;
			if (!assignments) return;

			assignments.map(parseSynergyAssignment).forEach(({ id }) => seenAssignmentIDs.add(id));
		});
	}
</script>

<svelte:head>
	<title>Grades - {brand}</title>
</svelte:head>

{#if allPeriods && currentPeriod && currentPeriodIndex !== undefined && currentGradebookState?.data}
	<div class="m-4 space-y-4">
		<Select.Root
			type="single"
			value={currentPeriodIndex.toString()}
			onValueChange={(value) => showGradebook(parseInt(value))}
		>
			<Select.Trigger class="mx-auto">
				{currentGradebookState.data.ReportingPeriod._GradePeriod}
			</Select.Trigger>

			<Select.Content>
				<Select.Group>
					<Select.Label>Reporting Periods</Select.Label>

					{#each allPeriods ?? [] as period, index (period._Index)}
						<Select.Item value={index.toString()} label={period._GradePeriod}>
							{period._GradePeriod}
						</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>

		{#if hasNoGrades}
			<Alert.Root class="mx-auto flex w-fit items-center">
				<CircleXIcon class="shrink-0" />
				It looks like you don't have any grades yet in this reporting period.

				{#if currentPeriodIndex > 0}
					<Button onclick={() => showGradebook(currentPeriodIndex - 1)} variant="outline">
						View {allPeriods[currentPeriodIndex - 1]?._GradePeriod}
					</Button>
				{/if}
			</Alert.Root>
		{/if}

		<ol class="flex flex-col items-center gap-4">
			{#each currentGradebookState.data.Courses.Course ?? [] as Course, index (Course._CourseID)}
				<li class="w-full max-w-3xl">
					<CourseButton
						{index}
						name={removeCourseType(Course._CourseName)}
						period={Course._Period}
						room={Course._Room}
						teacher={Course._Staff}
						teacherEmail={Course._StaffEMail}
						unseenAssignmentsCount={getCourseUnseenAssignmentsCount(Course)}
						grade={getCourseGrade(Course)}
					/>
				</li>
			{/each}
		</ol>

		{#if totalUnseenAssignments > 0}
			<Alert.Root class="mx-auto flex w-fit items-center gap-4 shadow-lg/30">
				<Alert.Title class="tracking-normal">
					{totalUnseenAssignments} new assignment{totalUnseenAssignments === 1 ? '' : 's'}
				</Alert.Title>
				<Button variant="outline" onclick={clearAllUnseenAssignments}>Mark as seen</Button>
			</Alert.Root>
		{/if}
	</div>
{/if}
