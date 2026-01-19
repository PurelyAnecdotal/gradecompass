<script lang="ts">
	import * as Chart from '$lib/components/ui/chart';
	import {
		calculateCourseGradePercentageFromCategories,
		calculateCourseGradePercentageFromTotals,
		getCalculableAssignments,
		getCalculableAssignmentsWithCategories,
		getPointsByCategory,
		type Assignment,
		type Calculable,
		type CalculableWithCategory,
		type Category
	} from '$lib/grades/assignments';
	import { cn } from '$lib/utils';
	import { Area, AreaChart, LinearGradient, Points } from 'layerchart';
	import { SvelteMap } from 'svelte/reactivity';

	interface Props {
		assignments: Assignment[];
		gradeCategories?: Category[];
		animate: boolean;
		error?: boolean;
	}
	let { assignments, gradeCategories, error = false }: Props = $props();

	interface DataPointMetadata {
		assignmentsOnDate: Assignment[];
	}

	const chartData: {
		date: Date;
		grade: number;
	}[] = $derived.by(() => {
		if (gradeCategories) {
			const assignmentsByDate: Map<number, CalculableWithCategory<Assignment>[]> = new SvelteMap();

			const calculableAssignments = getCalculableAssignmentsWithCategories(assignments);

			calculableAssignments.forEach((assignment) => {
				const ms = assignment.date.getTime();
				const existingAssignments = assignmentsByDate.get(ms) ?? [];
				assignmentsByDate.set(ms, [...existingAssignments, assignment]);
			});

			const entries = [...assignmentsByDate.entries()].toSorted(([ms_a], [ms_b]) => ms_a - ms_b);

			return entries
				.map(([ms, assignments], i) => {
					const assignmentsUntil = entries
						.map((entry) => entry[1])
						.slice(0, i + 1)
						.flat();

					const grade = calculateCourseGradePercentageFromCategories(
						getPointsByCategory(assignmentsUntil),
						gradeCategories
					);

					const metadata: DataPointMetadata = {
						assignmentsOnDate: assignments
					};

					return { date: new Date(ms), grade, metadata };
				})
				.filter((x) => x !== null);
		} else {
			const assignmentsByDate: Map<number, Calculable<Assignment>[]> = new SvelteMap();

			const calculableAssignments = getCalculableAssignments(assignments);

			calculableAssignments.forEach((assignment) => {
				const ms = assignment.date.getTime();
				const existingAssignments = assignmentsByDate.get(ms) ?? [];
				assignmentsByDate.set(ms, [...existingAssignments, assignment]);
			});

			const entries = [...assignmentsByDate.entries()].toSorted(([ms_a], [ms_b]) => ms_a - ms_b);

			return entries
				.map(([ms, assignments], i) => {
					const assignmentsUntil = entries
						.map((entry) => entry[1])
						.slice(0, i + 1)
						.flat();

					const grade = calculateCourseGradePercentageFromTotals(assignmentsUntil);

					const metadata: DataPointMetadata = {
						assignmentsOnDate: assignments
					};

					return { date: new Date(ms), grade, metadata };
				})
				.filter((x) => x !== null);
		}
	});

	const dayFormatter = new Intl.DateTimeFormat('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric'
	});

	const percentFormatter = new Intl.NumberFormat('en-US', {
		style: 'percent',
		maximumFractionDigits: 3
	});
</script>

<Chart.Container config={{}} class="m-4 aspect-auto h-64">
	<!-- https://techniq-docs-v2.layerchart.pages.dev/docs -->
	<AreaChart data={chartData} x="date" y="grade" yDomain={null}>
		{#snippet tooltip()}
			<Chart.Tooltip labelFormatter={dayFormatter.format} hideIndicator={true}>
				{#snippet formatter({ value, item })}
					<div>
						<p>{percentFormatter.format(Number(value) / 100)}</p>
						{#each (item.payload.metadata as DataPointMetadata).assignmentsOnDate as assignment (assignment.id)}
							<p>{assignment.name}</p>
						{/each}
					</div>
				{/snippet}
			</Chart.Tooltip>
		{/snippet}

		{#snippet marks()}
			<LinearGradient
				stops={['var(--tw-gradient-from)', 'var(--tw-gradient-via)', 'var(--tw-gradient-to)']}
				class={error
					? 'from-chart-bg-error/50 via-chart-bg-error/15 to-chart-bg-error/1'
					: 'from-chart-bg/50 via-chart-bg/15 to-chart-bg/1'}
				vertical
			>
				{#snippet children({ gradient })}
					<Area
						line={{ class: cn(['stroke-2', error ? 'stroke-chart-error' : 'stroke-chart']) }}
						fill={gradient}
					/>
				{/snippet}
			</LinearGradient>

			<Points r={4} class={error ? 'fill-chart-error' : 'fill-chart'} />
		{/snippet}
	</AreaChart>
</Chart.Container>
