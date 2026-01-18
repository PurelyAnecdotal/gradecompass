<script lang="ts">
	import * as Item from '$lib/components/ui/item';
	import * as Table from '$lib/components/ui/table';
	import { calculateGradePercentage, type Category } from '$lib/grades/assignments';

	interface Props {
		gradeCategories: Category[];
		hypotheticalMode: boolean;
		pointsByCategory: Map<string, { pointsEarned: number; pointsPossible: number }>;
	}
	let { gradeCategories, hypotheticalMode, pointsByCategory }: Props = $props();

	const categoryGradePercentages = $derived(
		new Map(
			pointsByCategory
				.entries()
				.map(([categoryName, { pointsEarned, pointsPossible }]) => [
					categoryName,
					calculateGradePercentage(pointsEarned, pointsPossible)
				])
		)
	);

	const roundPercentage = (percentage: number) => Math.round(percentage * 1000) / 1000;

	const countableCategoryWeightProportions = $derived(
		new Map(
			gradeCategories.flatMap(({ name, weightPercentage }) => {
				const points = pointsByCategory.get(name);
				if (!points || points.pointsPossible === 0) return [];

				return [[name, weightPercentage / 100] as const];
			})
		)
	);

	const totalCountedWeightProportion = $derived(
		countableCategoryWeightProportions
			.values()
			.reduce((sum, weightProportion) => sum + weightProportion, 0)
	);
</script>

<Item.Root variant="outline" class="mx-auto w-fit max-w-full">
	<Table.Root class="overflow-x-scroll">
		<Table.Header>
			<Table.Row>
				<Table.Head>Category</Table.Head>
				<Table.Head>Weight</Table.Head>
				{#if totalCountedWeightProportion !== 1}
					<Table.Head>Effective Weight</Table.Head>
				{/if}
				<Table.Head class="min-w-32">Points</Table.Head>
				<Table.Head class="min-w-32">Grade</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each gradeCategories as { name, pointsEarned, pointsPossible, gradeLetter, weightPercentage } (name)}
				<Table.Row>
					<Table.Cell>{name}</Table.Cell>
					<Table.Cell>{weightPercentage}%</Table.Cell>
					{#if totalCountedWeightProportion !== 1}
						<Table.Cell>
							{#if countableCategoryWeightProportions.has(name)}
								{roundPercentage(weightPercentage / totalCountedWeightProportion)}%
							{/if}
						</Table.Cell>
					{/if}
					<Table.Cell>
						{#if hypotheticalMode}
							{#if pointsByCategory.has(name)}
								{pointsByCategory.get(name)?.pointsEarned}
								/
								{pointsByCategory.get(name)?.pointsPossible}
							{/if}
						{:else}
							{pointsEarned} / {pointsPossible}
						{/if}
					</Table.Cell>
					<Table.Cell>
						{#if pointsEarned !== 0 || pointsPossible !== 0}
							{#if !hypotheticalMode}
								{gradeLetter}
								({roundPercentage(calculateGradePercentage(pointsEarned, pointsPossible))}%)
							{:else if categoryGradePercentages.has(name)}
								{roundPercentage(categoryGradePercentages.get(name)!)}%
							{/if}
						{/if}
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</Item.Root>
