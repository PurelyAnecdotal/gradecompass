<script lang="ts">
	import { removeCourseType } from '$lib';
	import { brand } from '$lib/brand';
	import * as Alert from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { parseSynergyAssignment } from '$lib/grades/assignments';
	import {
		getActiveGradebookRecord,
		getReportPeriodName,
		gradebookState,
		switchReportPeriod
	} from '$lib/grades/catalog.svelte';
	import { seenAssignmentIDs } from '$lib/grades/seenAssignments.svelte';
	import type { Course } from '$lib/types/Gradebook';
	import CircleXIcon from '@lucide/svelte/icons/circle-x';
	import CloudCheckIcon from '@lucide/svelte/icons/cloud-check';
	import CourseButton from './CourseButton.svelte';

	const gradebookCatalog = $derived(gradebookState.gradebookCatalog);

	const data = $derived(getActiveGradebookRecord()?.data);

	const reportPeriods = $derived(data?.ReportingPeriods.ReportPeriod);

	const activeReportPeriod = $derived(data?.ReportingPeriod);

	const activeReportPeriodIndex = $derived(
		gradebookCatalog ? (gradebookCatalog.overrideIndex ?? gradebookCatalog.defaultIndex) : undefined
	);

	const courses = $derived(data?.Courses.Course);

	$effect(() => {
		if (activeReportPeriodIndex === -1)
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
		courses
			? courses
					.map((course) => (course.Marks === '' ? 'N/A' : course.Marks.Mark._CalculatedScoreString))
					.every((score) => score === 'N/A')
			: false
	);

	const totalUnseenAssignments = $derived.by(() => {
		if (!courses) return 0;

		return courses.reduce((total, course) => {
			return total + getCourseUnseenAssignmentsCount(course);
		}, 0);
	});

	const clearCourseUnseenAssignments = (course: Course) => {
		if (course.Marks === '') return;
		const assignments = course.Marks.Mark.Assignments.Assignment;
		if (!assignments) return;

		assignments.map(parseSynergyAssignment).forEach(({ id }) => seenAssignmentIDs.add(id));
	};

	const clearAllUnseenAssignments = (courses: Course[]) =>
		courses.forEach(clearCourseUnseenAssignments);
</script>

<svelte:head>
	<title>Grades - {brand}</title>
</svelte:head>

{#if reportPeriods && activeReportPeriod && activeReportPeriodIndex !== undefined && data}
	<div class="m-4 space-y-4">
		<Select.Root
			type="single"
			bind:value={() => activeReportPeriodIndex.toString(), () => undefined}
			onValueChange={(value) => switchReportPeriod({ overrideIndex: parseInt(value) })}
			disabled={gradebookCatalog?.loadingIndex !== undefined}
		>
			<Select.Trigger class="mx-auto">
				{data.ReportingPeriod._GradePeriod}
			</Select.Trigger>

			<Select.Content>
				<Select.Group>
					<Select.Label>Report Periods</Select.Label>

					{#each reportPeriods as reportPeriod, index (reportPeriod._Index)}
						<Select.Item value={index.toString()} label={reportPeriod._GradePeriod}>
							{reportPeriod._GradePeriod}
							{#if gradebookCatalog?.reportingPeriods[index]}
								<CloudCheckIcon />
							{/if}
						</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>

		{#if hasNoGrades}
			<Alert.Root class="mx-auto flex w-fit items-center">
				<CircleXIcon class="shrink-0" />
				It looks like you don't have any grades yet in {activeReportPeriod._GradePeriod}.

				{#if activeReportPeriodIndex > 0}
					<Button
						onclick={() => switchReportPeriod({ overrideIndex: activeReportPeriodIndex - 1 })}
						variant="outline"
					>
						View {getReportPeriodName(activeReportPeriodIndex - 1)}
					</Button>
				{/if}
			</Alert.Root>
		{/if}

		<ol class="flex flex-col items-center gap-4">
			{#each courses as course, index (course._CourseID)}
				<li class="w-full max-w-3xl">
					<CourseButton
						{index}
						name={removeCourseType(course._CourseName)}
						period={course._Period}
						room={course._Room}
						teacher={course._Staff}
						teacherEmail={course._StaffEMail}
						unseenAssignmentsCount={getCourseUnseenAssignmentsCount(course)}
						grade={getCourseGrade(course)}
					/>
				</li>
			{/each}
		</ol>

		{#if courses && totalUnseenAssignments > 0}
			<Alert.Root class="mx-auto flex w-fit items-center gap-4 shadow-lg/30">
				<Alert.Title class="tracking-normal">
					{totalUnseenAssignments} new assignment{totalUnseenAssignments === 1 ? '' : 's'}
				</Alert.Title>
				<Button variant="outline" onclick={() => clearAllUnseenAssignments(courses)}
					>Mark as seen</Button
				>
			</Alert.Root>
		{/if}
	</div>
{/if}
