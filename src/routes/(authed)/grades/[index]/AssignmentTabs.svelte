<script lang="ts">
	import { bgColorVariants, type BadgeColor } from '$lib';
	import * as Tabs from '$lib/components/ui/tabs';
	import type {
		Category,
		Flowed,
		HiddenAssignment,
		ReactiveAssignment,
		RealAssignment
	} from '$lib/grades/assignments';
	import AssignmentCard from './AssignmentCard.svelte';

	interface Props {
		hypotheticalMode: boolean;
		assignments: (RealAssignment | Flowed<RealAssignment | HiddenAssignment>)[];
		reactiveAssignments: ReactiveAssignment[];
		gradeCategories: Category[] | undefined;
		assignmentCategoryNames: Set<string>;
		assignmentCategoryColors: Map<string, BadgeColor>;
		rawGradeCalcMatches: boolean;
		recalculateGradePercentage: () => void;
		seenAssignmentIDs?: Set<string>;
	}
	let {
		hypotheticalMode,
		assignments,
		reactiveAssignments,
		gradeCategories,
		assignmentCategoryNames,
		assignmentCategoryColors,
		rawGradeCalcMatches,
		recalculateGradePercentage,
		seenAssignmentIDs
	}: Props = $props();

	const categoryDropdownOptions = $derived(
		gradeCategories ? new Set(gradeCategories.map((category) => category.name)) : undefined
	);
</script>

<Tabs.Root value="all" class="mx-4 gap-4">
	<Tabs.List class="mx-auto h-12 max-w-full justify-start overflow-x-auto">
		<Tabs.Trigger value="all">All</Tabs.Trigger>

		{#each assignmentCategoryNames as categoryName (categoryName)}
			<Tabs.Trigger value={categoryName}>
				{#if assignmentCategoryColors.has(categoryName)}
					<div
						class={[
							bgColorVariants[assignmentCategoryColors.get(categoryName)!],
							'h-2 w-2 rounded-full'
						]}
					></div>
				{/if}
				{categoryName}
			</Tabs.Trigger>
		{/each}
	</Tabs.List>

	<Tabs.Content value="all">
		<ol class="flex flex-col items-center gap-4">
			{#if hypotheticalMode}
				{#each reactiveAssignments as { id, gradePercentageChange, hidden, newHypothetical, date, comments, category }, i (id)}
					{#if reactiveAssignments[i]}
						<li class="w-full max-w-4xl">
							{#if gradeCategories && categoryDropdownOptions}
								<AssignmentCard
									bind:name={reactiveAssignments[i].name}
									{id}
									bind:pointsEarned={reactiveAssignments[i].pointsEarned}
									bind:pointsPossible={reactiveAssignments[i].pointsPossible}
									bind:extraCredit={reactiveAssignments[i].extraCredit}
									gradePercentageChange={rawGradeCalcMatches ? gradePercentageChange : undefined}
									bind:notForGrade={reactiveAssignments[i].notForGrade}
									{hidden}
									showHypotheticalLabel={newHypothetical}
									bind:categoryDropdownSelected={reactiveAssignments[i].category}
									categoryDropdown={{
										names: categoryDropdownOptions,
										colors: assignmentCategoryColors
									}}
									{date}
									{comments}
									editable={true}
									{recalculateGradePercentage}
								/>
							{:else}
								<AssignmentCard
									bind:name={reactiveAssignments[i].name}
									{id}
									bind:pointsEarned={reactiveAssignments[i].pointsEarned}
									bind:pointsPossible={reactiveAssignments[i].pointsPossible}
									bind:extraCredit={reactiveAssignments[i].extraCredit}
									gradePercentageChange={rawGradeCalcMatches ? gradePercentageChange : undefined}
									bind:notForGrade={reactiveAssignments[i].notForGrade}
									{hidden}
									showHypotheticalLabel={newHypothetical}
									categoryBadge={category !== undefined
										? {
												name: category,
												color: assignmentCategoryColors.get(category) ?? 'default'
											}
										: undefined}
									{date}
									{comments}
									editable={true}
									{recalculateGradePercentage}
								/>
							{/if}
						</li>
					{/if}
				{/each}
			{:else}
				{#each assignments as assignment (assignment.id)}
					{@render assignmentSnippet(assignment, true)}
				{/each}
			{/if}
		</ol>
	</Tabs.Content>

	{#each assignmentCategoryNames as categoryName (categoryName)}
		<Tabs.Content value={categoryName}>
			<ol class="flex flex-col items-center gap-4">
				{#if hypotheticalMode}
					{#each reactiveAssignments as { category, id, gradePercentageChange, hidden, newHypothetical, date, comments }, i (id)}
						{#if category === categoryName && reactiveAssignments[i]}
							<li class="w-full max-w-4xl">
								{#if gradeCategories && categoryDropdownOptions && reactiveAssignments[i].category !== undefined}
									<AssignmentCard
										bind:name={reactiveAssignments[i].name}
										{id}
										bind:pointsEarned={reactiveAssignments[i].pointsEarned}
										bind:pointsPossible={reactiveAssignments[i].pointsPossible}
										bind:extraCredit={reactiveAssignments[i].extraCredit}
										gradePercentageChange={rawGradeCalcMatches ? gradePercentageChange : undefined}
										bind:notForGrade={reactiveAssignments[i].notForGrade}
										{hidden}
										showHypotheticalLabel={newHypothetical}
										bind:categoryDropdownSelected={reactiveAssignments[i].category}
										categoryDropdown={{
											names: categoryDropdownOptions,
											colors: assignmentCategoryColors
										}}
										{date}
										{comments}
										editable={true}
										{recalculateGradePercentage}
									/>
								{:else}
									<AssignmentCard
										bind:name={reactiveAssignments[i].name}
										{id}
										bind:pointsEarned={reactiveAssignments[i].pointsEarned}
										bind:pointsPossible={reactiveAssignments[i].pointsPossible}
										bind:extraCredit={reactiveAssignments[i].extraCredit}
										gradePercentageChange={rawGradeCalcMatches ? gradePercentageChange : undefined}
										bind:notForGrade={reactiveAssignments[i].notForGrade}
										{hidden}
										showHypotheticalLabel={newHypothetical}
										{date}
										{comments}
										editable={true}
										{recalculateGradePercentage}
									/>
								{/if}
							</li>
						{/if}
					{/each}
				{:else}
					{#each assignments as assignment (assignment.id)}
						{#if assignment.category === categoryName}
							{@render assignmentSnippet(assignment, false)}
						{/if}
					{/each}
				{/if}
			</ol>
		</Tabs.Content>
	{/each}
</Tabs.Root>

{#snippet assignmentSnippet(
	{
		name,
		id,
		pointsEarned,
		pointsPossible,
		unscaledPoints,
		extraCredit,
		gradePercentageChange,
		notForGrade,
		hidden,
		category,
		comments,
		date,
		newHypothetical
	}: RealAssignment | Flowed<RealAssignment | HiddenAssignment>,
	showCategory = true
)}
	<li class="w-full max-w-3xl">
		<AssignmentCard
			{name}
			{id}
			{pointsEarned}
			{pointsPossible}
			{unscaledPoints}
			{extraCredit}
			gradePercentageChange={rawGradeCalcMatches ? gradePercentageChange : undefined}
			{notForGrade}
			{hidden}
			showHypotheticalLabel={newHypothetical}
			categoryBadge={showCategory
				? { name: category, color: assignmentCategoryColors.get(category) ?? 'default' }
				: undefined}
			{date}
			{comments}
			unseen={seenAssignmentIDs && !seenAssignmentIDs.has(id)}
		/>
	</li>
{/snippet}
