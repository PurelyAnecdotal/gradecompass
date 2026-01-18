<script lang="ts">
	import { numberFlowDefaultEasing, type BadgeColor } from '$lib';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Field from '$lib/components/ui/field';
	import { NumberInput } from '$lib/components/ui/input';
	import * as Item from '$lib/components/ui/item';
	import { Label } from '$lib/components/ui/label';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import {
		calculatePointsNeededForTargetGrade,
		getCalculableAssignments,
		getCalculableAssignmentsWithCategories,
		type ReactiveAssignment,
		type TargetGradeCalculatorCategoryDependentOptions
	} from '$lib/grades/assignments';
	import SquareDashedMousePointerIcon from '@lucide/svelte/icons/square-dashed-mouse-pointer';
	import SquareMousePointerIcon from '@lucide/svelte/icons/square-mouse-pointer';
	import XIcon from '@lucide/svelte/icons/x';
	import NumberFlow, { NumberFlowGroup } from '@number-flow/svelte';
	import AssignmentCard from './AssignmentCard.svelte';

	interface Props {
		initialGradePercentage?: number;
		assignments: ReactiveAssignment[];
		categoryColors: Map<string, BadgeColor>;
		onclose: () => void;
		gradeCategoryWeightProportions?: Map<string, number>;
	}

	const {
		assignments,
		categoryColors,
		initialGradePercentage,
		gradeCategoryWeightProportions,
		onclose
	}: Props = $props();

	let targetGradePercentage = $state(initialGradePercentage);

	let targetAssignmentId = $state('');

	let targetAssignment = $derived(
		targetAssignmentId !== ''
			? assignments.find((assignment) => assignment.id === targetAssignmentId)
			: undefined
	);

	const categoryDependentOptions:
		| TargetGradeCalculatorCategoryDependentOptions<ReactiveAssignment>
		| undefined = $derived(
		gradeCategoryWeightProportions && targetAssignment?.category
			? {
					hasCategories: true,
					otherAssignments: getCalculableAssignmentsWithCategories(assignments).filter(
						({ id }) => id !== targetAssignment?.id
					),
					gradeCategoryWeightProportions,
					assignmentCategoryName: targetAssignment.category
				}
			: gradeCategoryWeightProportions === undefined
				? {
						hasCategories: false,
						otherAssignments: getCalculableAssignments(assignments).filter(
							({ id }) => id !== targetAssignment?.id
						)
					}
				: undefined
	);

	const targetGradePointsNeeded = $derived(
		targetGradePercentage !== undefined &&
			targetAssignment?.pointsPossible !== undefined &&
			categoryDependentOptions
			? calculatePointsNeededForTargetGrade({
					targetGradePercentage,
					assignmentPointsPossible: targetAssignment.pointsPossible,
					...categoryDependentOptions
				})
			: undefined
	);
</script>

<Item.Root variant="outline" class="mx-auto w-fit flex-col">
	<div class="flex w-full justify-between">
		<Item.Title>Target Grade Calculator</Item.Title>

		<Button onclick={onclose} variant="outline" size="icon-sm">
			<XIcon />
		</Button>
	</div>

	<div class="grid grid-flow-col grid-rows-2 gap-x-4">
		<Label for="target-grade-input">Target grade</Label>
		<p class="flex items-center text-sm">
			<NumberInput
				bind:value={targetGradePercentage}
				id="target-grade-input"
				class="w-20 text-right"
			/>%
		</p>

		<Label for="target-assignment-input">Target assignment</Label>

		<Dialog.Root>
			{#if targetAssignment}
				<p class="flex items-center gap-2">
					{targetAssignment.name}
					<Dialog.Trigger
						class={buttonVariants({ variant: 'outline', size: 'icon' })}
						title="Select another assignment"
					>
						<SquareDashedMousePointerIcon />
					</Dialog.Trigger>
				</p>
			{:else}
				<Dialog.Trigger class={[buttonVariants({ variant: 'default' }), 'w-fit']}>
					<SquareMousePointerIcon />
					Select
				</Dialog.Trigger>
			{/if}

			<Dialog.Content
				class="flex h-[calc(100%-2rem)] max-h-full w-[calc(100%-2rem)] flex-col sm:max-w-3xl"
			>
				<Dialog.Header class="text-start">
					<Dialog.Title>Select Assignment</Dialog.Title>
					<Dialog.Description>
						To use an assignment that has not yet been entered, first create it as a hypothetical
						assignment, then select it in this menu.
					</Dialog.Description>
				</Dialog.Header>

				<RadioGroup.Root bind:value={targetAssignmentId} class="overflow-y-scroll">
					{#each assignments as { name, id, pointsEarned, pointsPossible, unscaledPoints, extraCredit, notForGrade, hidden, newHypothetical, category, date, comments } (id)}
						<Field.Field orientation="horizontal">
							<RadioGroup.Item value={id} id="assignment-picker-{id}" />

							<Field.Label for="assignment-picker-{id}" class="block">
								<AssignmentCard
									{name}
									{id}
									{pointsEarned}
									{pointsPossible}
									{unscaledPoints}
									{extraCredit}
									{notForGrade}
									{hidden}
									showHypotheticalLabel={newHypothetical}
									categoryBadge={category !== undefined
										? { name: category, color: categoryColors.get(category) ?? 'default' }
										: undefined}
									{date}
									{comments}
								/>
							</Field.Label>
						</Field.Field>
					{/each}
				</RadioGroup.Root>
			</Dialog.Content>
		</Dialog.Root>
	</div>

	<div class="w-full">
		{#if targetAssignment?.pointsPossible !== undefined && !(gradeCategoryWeightProportions && targetAssignment.category === undefined) && targetGradePointsNeeded !== undefined}
			<p class="text-sm">Required assignment grade:</p>

			<div class="mt-2 ml-auto w-fit text-lg">
				<NumberFlowGroup>
					<NumberFlow
						value={targetGradePointsNeeded}
						format={{ maximumFractionDigits: 3 }}
						spinTiming={{ duration: 400, easing: numberFlowDefaultEasing }}
						suffix="/{targetAssignment.pointsPossible} "
						class="font-bold [&::part(suffix)]:ml-[0.0625em] [&::part(suffix)]:text-sm [&::part(suffix)]:font-normal [&::part(suffix)]:text-gray-300 [&::part(suffix)]:dark:text-gray-400"
					/>
					<NumberFlow
						value={targetGradePointsNeeded / targetAssignment.pointsPossible}
						format={{ style: 'percent', maximumFractionDigits: 3 }}
						spinTiming={{ duration: 400, easing: numberFlowDefaultEasing }}
						class="font-bold"
					/>
				</NumberFlowGroup>
			</div>
		{/if}

		{#if targetAssignment && targetAssignment.pointsPossible === undefined}
			<p class="mt-4 text-sm">Selected assignment is missing the "points possible" value.</p>
		{/if}

		{#if targetAssignment && gradeCategoryWeightProportions && targetAssignment.category === undefined}
			<p class="mt-4 text-sm">Selected assignment is missing a category.</p>
		{/if}
	</div>
</Item.Root>
