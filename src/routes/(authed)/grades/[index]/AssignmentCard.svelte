<script lang="ts">
	import { bgColorVariants, type BadgeColor } from '$lib';
	import DateBadge from '$lib/components/DateBadge.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input, NumberInput } from '$lib/components/ui/input/index';
	import { Label } from '$lib/components/ui/label';
	import * as Popover from '$lib/components/ui/popover';
	import { Progress } from '$lib/components/ui/progress';
	import * as Select from '$lib/components/ui/select';
	import { calculateGradePercentage } from '$lib/grades/assignments';
	import MessageCircleIcon from '@lucide/svelte/icons/message-circle';

	type Props = {
		name: string;
		id: string;
		pointsEarned?: number;
		pointsPossible?: number;
		unscaledPoints?: { pointsEarned: number; pointsPossible: number };
		extraCredit?: boolean;
		gradePercentageChange?: number;
		notForGrade?: boolean;
		hidden?: boolean;
		showHypotheticalLabel?: boolean;
		categoryBadge?: { name: string; color: BadgeColor };
		date?: Date | undefined;
		editable?: boolean;
		unseen?: boolean;
		comments?: string;
		recalculateGradePercentage?: () => void;
	} & (
		| {
				editable?: false;
				categoryDropdownSelected?: undefined;
				categoryDropdown?: undefined;
		  }
		| {
				editable: true;
				categoryDropdownSelected?: string | undefined;
				categoryDropdown?: { names: Set<string>; colors?: Map<string, BadgeColor> };
		  }
	);
	let {
		name = $bindable(),
		id,
		pointsEarned = $bindable(),
		pointsPossible = $bindable(),
		unscaledPoints = $bindable(),
		extraCredit = $bindable(false),
		gradePercentageChange,
		notForGrade = $bindable(false),
		hidden = false,
		showHypotheticalLabel = false,
		categoryBadge,
		categoryDropdownSelected = $bindable(undefined),
		categoryDropdown,
		date = undefined,
		editable = false,
		unseen = false,
		comments = undefined,
		recalculateGradePercentage = () => {}
	}: Props = $props();

	const percentage = $derived(
		pointsEarned !== undefined && pointsPossible !== undefined
			? calculateGradePercentage(pointsEarned, pointsPossible)
			: 0
	);

	const progressValue = $derived.by(() => {
		// For assignments with a zero, show the progress bar as full to allow you to see the red color
		if (pointsEarned === 0 && pointsPossible !== undefined && pointsPossible > 0) return 100;

		if (percentage > 100 && pointsPossible && pointsEarned && !extraCredit)
			return calculateGradePercentage(pointsPossible, pointsEarned);

		return Math.min(percentage, 100);
	});

	const progressIndicatorColor = $derived.by(() => {
		if (extraCredit) return 'indigo';
		if (percentage >= 90) return 'green';
		if (percentage >= 80) return 'yellow';
		return 'red';
	});

	const gradePercentageChangeRounded = $derived(
		Math.round((gradePercentageChange ?? 0) * 100) / 100
	);

	const getCategory = () => categoryDropdownSelected ?? '';

	function setCategory(newCategory: string) {
		categoryDropdownSelected = newCategory === '' ? undefined : newCategory;
	}
</script>

<Card.Root
	class={[
		'max-w-full items-center gap-2 p-4 transition duration-500 sm:flex-row',
		unseen && 'border-l-4 border-l-green-400 dark:border-l-green-600'
	]}
>
	<div class="flex flex-1 flex-col gap-1 self-start sm:self-auto">
		<div class="flex flex-wrap gap-1">
			{#if editable}
				<Input bind:value={name} class="inline w-32 sm:w-48" />

				{#if categoryDropdown}
					<Select.Root
						type="single"
						bind:value={getCategory, setCategory}
						onValueChange={recalculateGradePercentage}
					>
						<Select.Trigger>
							{#if categoryDropdownSelected !== undefined && categoryDropdown.colors?.has(categoryDropdownSelected)}
								<div
									class={[
										bgColorVariants[categoryDropdown.colors.get(categoryDropdownSelected)!],
										'h-2 w-2 rounded-full'
									]}
								></div>
							{/if}
							{categoryDropdownSelected ?? 'Select category'}
						</Select.Trigger>

						<Select.Content>
							<Select.Group>
								<Select.Label>Category</Select.Label>

								{#each categoryDropdown.names as dropdownCategory (dropdownCategory)}
									<Select.Item value={dropdownCategory}>
										{#if categoryDropdown.colors}
											<div
												class={[
													bgColorVariants[categoryDropdown.colors.get(dropdownCategory)!],
													'h-2 w-2 rounded-full'
												]}
											></div>
										{/if}
										{dropdownCategory}
									</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				{/if}
			{:else}
				{name}
			{/if}
		</div>

		<div class="flex flex-wrap gap-1">
			{#if categoryBadge}
				<Badge color={categoryBadge.color} outline={false} title="Category">
					{categoryBadge.name}
				</Badge>
			{/if}

			{#if pointsEarned === undefined}
				<Badge color="purple" outline={true}>Not Graded</Badge>
			{/if}

			{#if notForGrade}
				<Badge color="pink" outline={true} title="Not calculated in grade">
					{#if editable}
						<Checkbox
							bind:checked={notForGrade}
							onchange={recalculateGradePercentage}
							id="{id}-not-for-grade"
						/>
						<Label for="{id}-not-for-grade" class="text-xs">Not For Grade</Label>
					{:else}
						Not For Grade
					{/if}
				</Badge>
			{/if}

			{#if extraCredit}
				<Badge
					color="indigo"
					outline={true}
					class="inline-flex"
					title="Calculated as if zero points were possible"
				>
					{#if editable}
						<Checkbox
							bind:checked={extraCredit}
							onchange={recalculateGradePercentage}
							id="{id}-extra-credit"
						/>
						<Label for="{id}-extra-credit" class="text-xs">Extra Credit</Label>
					{:else}
						Extra Credit
					{/if}
				</Badge>
			{/if}

			{#if hidden}
				<Badge variant="secondary" outline={true} class="hidden-badge">Hidden Assignments</Badge>
			{/if}

			{#if unscaledPoints}
				<Badge variant="secondary" outline={true}>Scaled</Badge>
			{/if}

			{#if showHypotheticalLabel}
				<Badge variant="outline">Hypothetical</Badge>
			{/if}

			{#if date}
				<DateBadge {date} />
			{/if}

			{#if unseen}
				<Badge color="green" outline={true}>New</Badge>
			{/if}
		</div>
	</div>

	<div class="flex w-full flex-col items-end gap-2 sm:w-auto">
		<div class="flex items-center gap-2">
			{#if comments !== undefined && !editable}
				<Popover.Root>
					<Popover.Trigger
						class={buttonVariants({ variant: 'outline', size: 'icon' })}
						title="Teacher comments"
					>
						<MessageCircleIcon />
					</Popover.Trigger>
					<Popover.Content>{comments}</Popover.Content>
				</Popover.Root>
			{/if}

			{#if gradePercentageChange !== undefined}
				{#if gradePercentageChangeRounded < 0}
					<span class="text-red-500" title="Overall grade percentage change">
						{gradePercentageChangeRounded}%
					</span>
				{:else if gradePercentageChangeRounded > 0}
					<span class="text-green-500" title="Overall grade percentage change">
						+{gradePercentageChangeRounded}%
					</span>
				{:else if !notForGrade && pointsEarned !== undefined && !isNaN(pointsEarned)}
					<span class="text-slate-500" title="Overall grade percentage change">+0%</span>
				{/if}
			{/if}

			{#if unscaledPoints}
				<span class="text-gray-400" title="Points before scaling">
					({unscaledPoints.pointsEarned}/{unscaledPoints.pointsPossible})
				</span>
			{/if}

			{#if editable}
				{#if percentage && percentage !== Infinity}
					<span title="Assignment grade percentage">{Math.round(percentage * 100) / 100}%</span>
				{/if}

				<div class="flex w-40 items-center gap-1">
					<NumberInput
						title="Points earned"
						bind:value={pointsEarned}
						oninput={recalculateGradePercentage}
					/>
					/
					<NumberInput
						title="Points possible"
						bind:value={pointsPossible}
						oninput={recalculateGradePercentage}
					/>
				</div>
			{:else if pointsEarned === undefined}
				<span title="Points possible">{pointsPossible}</span>
			{:else}
				<span title="Points earned/Points possible">
					{pointsEarned}/{#if extraCredit}
						<span class="text-indigo-800 dark:text-indigo-400">{pointsPossible}</span>
					{:else}
						{pointsPossible}
					{/if}
				</span>
				{#if percentage && percentage !== Infinity}
					<span title="Assignment grade percentage">{Math.round(percentage * 100) / 100}%</span>
				{/if}
			{/if}
		</div>

		{#if pointsEarned !== undefined || editable}
			<Progress
				value={progressValue}
				class={[percentage > 100 ? 'bg-indigo-700' : '', 'w-48 transition-all lg:w-64']}
				indicatorClass={bgColorVariants[progressIndicatorColor]}
			/>
		{/if}
	</div>
</Card.Root>
