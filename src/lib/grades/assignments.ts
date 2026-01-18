import type { AssignmentEntity, Course } from '../types/Gradebook';

export interface Category {
	name: string;
	weightPercentage: number;
	pointsEarned: number;
	pointsPossible: number;
	weightedPercentage: number;
	gradeLetter: string;
}

export interface Assignment {
	name: string;
	id: string;
	pointsEarned: number | undefined;
	pointsPossible: number | undefined;
	unscaledPoints: { pointsEarned: number; pointsPossible: number } | undefined;
	extraCredit: boolean;
	gradePercentageChange: number | undefined;
	notForGrade: boolean;
	hidden: boolean;
	category: string | undefined;
	date: Date;
	comments?: string;
	newHypothetical: boolean;
}

export interface RealAssignment extends Assignment {
	hidden: false;
	category: string;
	newHypothetical: false;
}

export interface HiddenAssignment extends Assignment {
	pointsEarned: number;
	pointsPossible: number;
	unscaledPoints: undefined;
	extraCredit: false;
	notForGrade: false;
	hidden: true;
	category: string;
	newHypothetical: false;
}

export interface ReactiveAssignment extends Assignment {
	reactive: true;
}

export interface NewHypotheticalAssignment extends ReactiveAssignment {
	newHypothetical: true;
	unscaledPoints: undefined;
	extraCredit: false;
	hidden: false;
}

export type Calculable<T extends Assignment> = T & {
	pointsEarned: number;
	pointsPossible: number;
	notForGrade: false;
};

export type CalculableWithCategory<T extends Assignment> = Calculable<T> & {
	category: string;
};

export type Flowed<T extends Assignment> = Calculable<T> & {
	gradePercentageChange: number;
};

interface PointsByCategory {
	[categoryName: string]: {
		pointsEarned: number;
		pointsPossible: number;
	};
}

export function calculateGradePercentage(pointsEarned: number, pointsPossible: number) {
	let gradePercentage = (pointsEarned / pointsPossible) * 100;

	if (isNaN(gradePercentage)) gradePercentage = 0;

	return gradePercentage;
}

export function calculateCourseGradePercentageFromCategories(
	pointsByCategory: PointsByCategory,
	gradeCategories: Category[]
) {
	let gradePercentage = 0;
	if (Object.entries(pointsByCategory).length === 0) return 0;

	let totalWeight = 0;

	Object.entries(pointsByCategory).forEach(([categoryName, categoryPoints]) => {
		const category = gradeCategories.find((category) => category.name === categoryName);
		if (!category) return;

		gradePercentage +=
			(categoryPoints.pointsEarned / categoryPoints.pointsPossible) * category.weightPercentage;
		totalWeight += category.weightPercentage;
	});

	gradePercentage = (gradePercentage / totalWeight) * 100;

	if (isNaN(gradePercentage)) {
		console.error('Grade percentage is NaN');
		return 0;
	}

	return gradePercentage;
}

export function calculateCourseGradePercentageFromTotals<T extends Assignment>(
	assignments: Calculable<T>[]
) {
	const { pointsEarned, pointsPossible } = getAssignmentPointTotals(assignments);

	return calculateGradePercentage(pointsEarned, pointsPossible);
}

function flowAssignmentFromTotals<T extends Assignment>(
	assignment: Calculable<T>,
	totalPointsEarned: number,
	totalPointsPossible: number
): { assignment: Flowed<T>; totalPointsEarned: number; totalPointsPossible: number } {
	const { pointsEarned, pointsPossible, extraCredit } = assignment;

	const priorGrade = calculateGradePercentage(totalPointsEarned, totalPointsPossible);

	totalPointsEarned += pointsEarned;
	totalPointsPossible += extraCredit ? 0 : pointsPossible;

	const afterGrade = calculateGradePercentage(totalPointsEarned, totalPointsPossible);

	const gradePercentageChange = afterGrade - priorGrade;

	const calculable = { ...assignment, gradePercentageChange };

	return { assignment: calculable, totalPointsEarned, totalPointsPossible };
}

function flowAssignmentFromCategories<T extends Assignment>(
	assignment: CalculableWithCategory<T>,
	pointsByCategory: PointsByCategory,
	gradeCategories: Category[]
): { assignment: Flowed<T>; pointsByCategory: PointsByCategory } {
	const { pointsEarned, pointsPossible, category, extraCredit } = assignment;

	const priorGrade = calculateCourseGradePercentageFromCategories(
		pointsByCategory,
		gradeCategories
	);

	const categoryPoints = pointsByCategory[category] ?? { pointsEarned: 0, pointsPossible: 0 };
	pointsByCategory[category] = {
		pointsEarned: categoryPoints.pointsEarned + pointsEarned,
		pointsPossible: categoryPoints.pointsPossible + (extraCredit ? 0 : pointsPossible)
	};

	const afterGrade = calculateCourseGradePercentageFromCategories(
		pointsByCategory,
		gradeCategories
	);

	const gradePercentageChange = afterGrade - priorGrade;

	const calculable = { ...assignment, gradePercentageChange };

	return { assignment: calculable, pointsByCategory };
}

export function calculateAssignmentGPCsFromCategories<T extends Assignment>(
	assignments: T[],
	gradeCategories: Category[]
) {
	let pointsByCategory: PointsByCategory = {};

	const flowedAssignments: (T | Flowed<T>)[] = assignments
		.toReversed()
		.map((assignment) => {
			const { pointsEarned, pointsPossible, notForGrade, category } = assignment;

			if (
				pointsEarned === undefined ||
				pointsPossible === undefined ||
				notForGrade ||
				category === undefined
			)
				return assignment;

			const calculable: CalculableWithCategory<T> = {
				...assignment,
				pointsEarned,
				pointsPossible,
				notForGrade,
				category
			};

			const flowed = flowAssignmentFromCategories(calculable, pointsByCategory, gradeCategories);

			pointsByCategory = flowed.pointsByCategory;

			return flowed.assignment;
		})
		.toReversed();

	return flowedAssignments;
}

export function calculateAssignmentGPCsFromTotals<T extends Assignment>(assignments: T[]) {
	let totalPointsEarned = 0;
	let totalPointsPossible = 0;

	const flowedAssignments: (T | Flowed<T>)[] = assignments
		.toReversed()
		.map((assignment) => {
			const { pointsEarned, pointsPossible, notForGrade, category } = assignment;

			if (
				pointsEarned === undefined ||
				pointsPossible === undefined ||
				notForGrade ||
				category === undefined
			)
				return assignment;

			const calculable: Calculable<T> = {
				...assignment,
				pointsEarned,
				pointsPossible,
				notForGrade,
				category
			};

			const flowed = flowAssignmentFromTotals(calculable, totalPointsEarned, totalPointsPossible);
			totalPointsEarned = flowed.totalPointsEarned;
			totalPointsPossible = flowed.totalPointsPossible;
			return flowed.assignment;
		})
		.toReversed();

	return flowedAssignments;
}

export function calculateAssignmentGPCs<T extends Assignment>(
	assignments: T[],
	gradeCategories?: Category[]
) {
	if (gradeCategories === undefined) {
		return calculateAssignmentGPCsFromTotals(assignments);
	}

	return calculateAssignmentGPCsFromCategories(assignments, gradeCategories);
}

export function getHiddenAssignmentsFromCategories(
	categories: Category[],
	pointsByCategory: PointsByCategory
) {
	return categories
		.filter((category) => {
			const categoryPoints = pointsByCategory[category.name];
			if (categoryPoints === undefined) return false;
			return (
				category.pointsEarned !== categoryPoints.pointsEarned ||
				category.pointsPossible !== categoryPoints.pointsPossible
			);
		})
		.map((category) => {
			const categoryPoints = pointsByCategory[category.name];
			if (categoryPoints === undefined) return null;

			const { pointsEarned, pointsPossible } = categoryPoints;

			const hiddenPointsEarned = category.pointsEarned - pointsEarned;
			const hiddenPointsPossible = category.pointsPossible - pointsPossible;

			// Calculate grade prior to the assignment
			const priorGrade = calculateCourseGradePercentageFromCategories(pointsByCategory, categories);

			pointsByCategory[category.name] = {
				pointsEarned: pointsEarned + hiddenPointsEarned,
				pointsPossible: pointsPossible + hiddenPointsPossible
			};

			// Calculate grade after the assignment
			const afterGrade = calculateCourseGradePercentageFromCategories(pointsByCategory, categories);

			// Calculate grade percentage change and initalize hypothetical gradebook
			const gradePercentageChange = afterGrade - priorGrade;

			if (Math.abs(gradePercentageChange) < 0.0001) return null;

			const hiddenAssignment: Flowed<HiddenAssignment> = {
				name: `Hidden ${category.name} Assignments`,
				id: randomAssignmentID(),
				pointsEarned: hiddenPointsEarned,
				pointsPossible: hiddenPointsPossible,
				unscaledPoints: undefined,
				extraCredit: false,
				gradePercentageChange,
				notForGrade: false,
				hidden: true,
				category: category.name,
				date: new Date(),
				newHypothetical: false
			};

			return hiddenAssignment;
		})
		.filter((x) => x !== null);
}

export const randomAssignmentID = () => Math.random().toString(36).substring(2, 15);

export function getPointsByCategory<T extends Assignment>(
	assignments: CalculableWithCategory<T>[]
) {
	const pointsByCategory: PointsByCategory = {};

	assignments.forEach((assignment) => {
		const { category, pointsEarned, pointsPossible, extraCredit } = assignment;

		const categoryPoints = pointsByCategory[category] ?? { pointsEarned: 0, pointsPossible: 0 };

		pointsByCategory[category] = {
			pointsEarned: categoryPoints.pointsEarned + pointsEarned,
			pointsPossible: categoryPoints.pointsPossible + (extraCredit ? 0 : pointsPossible)
		};
	});

	return pointsByCategory;
}

export function getPointsByCategoryMap<T extends Assignment>(
	assignments: CalculableWithCategory<T>[]
) {
	const pointsByCategory: Map<string, { pointsEarned: number; pointsPossible: number }> = new Map();

	assignments.forEach((assignment) => {
		const { category, pointsEarned, pointsPossible, extraCredit } = assignment;

		const categoryPoints = pointsByCategory.get(category) ?? { pointsEarned: 0, pointsPossible: 0 };

		pointsByCategory.set(category, {
			pointsEarned: categoryPoints.pointsEarned + pointsEarned,
			pointsPossible: categoryPoints.pointsPossible + (extraCredit ? 0 : pointsPossible)
		});
	});

	return pointsByCategory;
}

function countDecimalPlaces(num: number) {
	const numStr = num.toString();
	const decimalIndex = numStr.indexOf('.');

	if (decimalIndex === -1) return 0;

	return numStr.length - decimalIndex - 1;
}

function roundToPrecision(num: number, precision: number) {
	const factor = Math.pow(10, precision);
	return Math.round(num * factor) / factor;
}

function floorToPrecision(num: number, precision: number) {
	const factor = Math.pow(10, precision);
	return Math.floor(num * factor) / factor;
}

export function gradesMatch(rawGrade: number, expectedGrade: number) {
	const leastPrecision = Math.min(countDecimalPlaces(rawGrade), countDecimalPlaces(expectedGrade));

	const roundedMatches =
		roundToPrecision(rawGrade, leastPrecision) === roundToPrecision(expectedGrade, leastPrecision);

	const flooredMatches =
		floorToPrecision(rawGrade, leastPrecision) === floorToPrecision(expectedGrade, leastPrecision);

	return roundedMatches || flooredMatches;
}

export function getAssignmentPointTotals<T extends Assignment>(assignments: Calculable<T>[]) {
	let pointsEarned = 0;
	let pointsPossible = 0;

	assignments.forEach((assignment) => {
		const { pointsEarned: earned, pointsPossible: possible, extraCredit } = assignment;

		pointsEarned += earned;
		if (!extraCredit) pointsPossible += possible;
	});

	return { pointsEarned, pointsPossible };
}

export function getSynergyCourseAssignmentCategories(course: Course) {
	if (course?.Marks === '') return undefined;

	const gradeCalcSummary = course?.Marks.Mark.GradeCalculationSummary;

	if (typeof gradeCalcSummary === 'string' || !gradeCalcSummary?.AssignmentGradeCalc)
		return undefined;

	const categories: Category[] = gradeCalcSummary.AssignmentGradeCalc.map((category) => ({
		name: category._Type,
		weightPercentage: parseFloat(category._Weight),
		pointsEarned: parseFloat(category._Points),
		pointsPossible: parseFloat(category._PointsPossible),
		weightedPercentage: parseFloat(category._WeightedPct),
		gradeLetter: category._CalculatedMark
	}));

	return categories;
}

export function getCalculableAssignments<T extends Assignment>(assignments: T[]) {
	return assignments
		.map((assignment) => {
			const { pointsEarned, pointsPossible, notForGrade } = assignment;

			if (pointsEarned === undefined || pointsPossible === undefined || notForGrade) return null;

			const calculable: Calculable<T> = {
				...assignment,
				pointsEarned,
				pointsPossible,
				notForGrade
			};

			return calculable;
		})
		.filter((assignments) => assignments !== null);
}

export function getCalculableAssignmentsWithCategories<T extends Assignment>(assignments: T[]) {
	return assignments
		.map((assignment) => {
			const { pointsEarned, pointsPossible, notForGrade, category } = assignment;

			if (
				pointsEarned === undefined ||
				pointsPossible === undefined ||
				notForGrade ||
				category === undefined
			)
				return null;

			const calculable: CalculableWithCategory<T> = {
				...assignment,
				pointsEarned,
				pointsPossible,
				notForGrade,
				category
			};

			return calculable;
		})
		.filter((assignments) => assignments !== null);
}

export function parseSynergyAssignment(synergyAssignment: AssignmentEntity) {
	const {
		_Date,
		_Measure,
		_Notes,
		_Point,
		_PointPossible,
		_Points,
		_ScoreCalValue,
		_ScoreMaxValue,
		_Type
	} = synergyAssignment;

	// Edge Cases:

	// Normal:
	// _Point: "3"
	// _PointPossible: "4"
	// _Points: "3 / 4"
	// _ScoreCalValue: "3"
	// _ScoreMaxValue: "4"
	// _DisplayScore: "3 out of 4"

	// Not Graded:
	// _Point: undefined
	// _PointPossible: undefined
	// _Points: "4 Points Possible"
	// _ScoreCalValue: undefined
	// _ScoreMaxValue: "4" or undefined
	// _DisplayScore: "Not Graded"

	// Not Graded (Empty):
	// _Point: undefined
	// _PointPossible: undefined
	// _Points: "Points Possible"
	// _ScoreCalValue: undefined
	// _ScoreMaxValue: undefined
	// _DisplayScore: "Not Graded"

	// Zero (Blank _Point):
	// _Point: ""
	// _PointPossible: "4"
	// _Points: "/ 4"
	// _ScoreCalValue: "0"
	// _ScoreMaxValue: "4"
	// _DisplayScore: "0 out of 4"

	// Extra Credit:
	// _Point: "3"
	// _PointPossible: ""
	// _Points: "3 /"
	// _ScoreCalValue: "3"
	// _ScoreMaxValue: "4"
	// _DisplayScore: "3 out of 4"

	// Not For Grading:
	// _Point: "3"
	// _PointPossible: "4"
	// _Points: "3 / 4"
	// _ScoreCalValue: "3"
	// _ScoreMaxValue: "4"
	// _DisplayScore: "3 out of 4"
	// _Notes : "(Not For Grading)"

	// Scaled:
	// _Point: "6"
	// _PointPossible: "8"
	// _Points: "6 / 8"
	// _ScoreCalValue: "3"
	// _ScoreMaxValue: "4"
	// _DisplayScore: "3 out of 4"

	const pointsEarned = _Point !== undefined ? (_Point === '' ? 0 : parseFloat(_Point)) : undefined; // _Point can be empty; equivalent to 0

	const pointsPossible =
		_PointPossible !== undefined && _PointPossible !== ''
			? parseFloat(_PointPossible)
			: _ScoreMaxValue !== undefined
				? parseFloat(_ScoreMaxValue)
				: _Points === 'Points Possible'
					? undefined
					: parseFloat(_Points.split(' Points Possible')[0]);

	const pointsEarnedIsScaled =
		_Point !== undefined &&
		_Point !== '' &&
		_ScoreCalValue !== undefined &&
		_Point !== _ScoreCalValue;

	const pointsPossibleIsScaled =
		_PointPossible !== undefined &&
		_PointPossible !== '' &&
		_ScoreMaxValue !== undefined &&
		_PointPossible !== _ScoreMaxValue;

	let unscaledPoints: { pointsEarned: number; pointsPossible: number } | undefined = undefined;

	if (
		(pointsEarnedIsScaled || pointsPossibleIsScaled) &&
		_ScoreCalValue !== undefined &&
		_ScoreMaxValue !== undefined
	) {
		unscaledPoints = {
			pointsEarned: parseFloat(_ScoreCalValue),
			pointsPossible: parseFloat(_ScoreMaxValue)
		};
	}

	const notesFormatted = _Notes.replace('(Not For Grading)', '');

	const assignment: RealAssignment = {
		name: _Measure,
		id: synergyAssignment._GradebookID,
		pointsEarned,
		pointsPossible,
		unscaledPoints,
		extraCredit: _PointPossible === '',
		gradePercentageChange: undefined,
		notForGrade: _Notes.includes('(Not For Grading)'),
		hidden: false,
		category: _Type,
		date: new Date(_Date),
		comments: notesFormatted.length > 0 ? notesFormatted : undefined,
		newHypothetical: false
	};

	return assignment;
}

export type TargetGradeCalculatorCategoryDependentOptions<T extends Assignment> =
	| {
			hasCategories: false;
			otherAssignments: Calculable<T>[];
	  }
	| {
			hasCategories: true;
			otherAssignments: CalculableWithCategory<T>[];
			gradeCategoryWeightProportions: Map<string, number>;
			assignmentCategoryName: string;
	  };

type TargetGradeCalculatorOptions<T extends Assignment> = {
	targetGradePercentage: number;
	assignmentPointsPossible: number;
} & TargetGradeCalculatorCategoryDependentOptions<T>;

export function calculatePointsNeededForTargetGrade<T extends Assignment>({
	targetGradePercentage,
	assignmentPointsPossible,
	...categoryDependentParams
}: TargetGradeCalculatorOptions<T>) {
	const targetGradeProportion = targetGradePercentage / 100;

	if (categoryDependentParams.hasCategories) {
		const { otherAssignments, gradeCategoryWeightProportions, assignmentCategoryName } =
			categoryDependentParams;

		// Get the weight proportion for the target assignment's category
		const targetCategoryWeightProportion =
			gradeCategoryWeightProportions.get(assignmentCategoryName);
		if (!targetCategoryWeightProportion) {
			console.error(
				`Cannot calculate points needed for target grade: gradeCategories does not contain ${assignmentCategoryName}`
			);
			return NaN;
		}

		// Calculate categories' respective points earned/possible (excluding points from the target assignment)
		const otherPointsByCategory = getPointsByCategoryMap(otherAssignments);

		const categoryData = new Map<
			string,
			{ weightProportion: number; otherPointsEarned: number; otherPointsPossible: number }
		>();
		gradeCategoryWeightProportions.forEach((weightProportion, categoryName) => {
			const otherPoints = otherPointsByCategory.get(categoryName) ?? {
				pointsEarned: 0,
				pointsPossible: 0
			};

			categoryData.set(categoryName, {
				weightProportion,
				otherPointsEarned: otherPoints.pointsEarned,
				otherPointsPossible: otherPoints.pointsPossible
			});
		});
		if (categoryData.size === 0) {
			console.error('Cannot calculate points needed for target grade: no categories found');
			return NaN;
		}

		// Get all the other categories which are included in grade calculation (i.e. pointsPossible != 0)
		const otherCountableCategories = new Map(
			categoryData
				.entries()
				.filter(
					([categoryName, { otherPointsPossible }]) =>
						categoryName !== assignmentCategoryName && otherPointsPossible !== 0
				)
				.map(([name, { otherPointsEarned, otherPointsPossible, ...rest }]) => [
					name,
					{
						pointsEarned: otherPointsEarned, // since the target assignment's category is excluded, these ARE all the points in this category
						pointsPossible: otherPointsPossible,
						...rest
					}
				])
		);

		// Calculate the total weight of all categories included in grade calculation (plus the target assignment's category, if not otherwise included)
		const totalCountedWeightProportion =
			otherCountableCategories
				.values()
				.reduce((sum, { weightProportion }) => sum + weightProportion, 0) +
			targetCategoryWeightProportion;

		// Calculate the sum of the weighted grade proportions from all other countable categories
		const otherCountedCategoriesWeightedGradeProportion = otherCountableCategories
			.values()
			.reduce((sum, { weightProportion, pointsEarned, pointsPossible }) => {
				const gradeProportion = pointsEarned / pointsPossible;
				const weightedGradeProportion = gradeProportion * weightProportion;
				return sum + weightedGradeProportion;
			}, 0);

		// Calculate what the weighted grade proportion for the target assignment's category needs to be
		const targetCategoryWeightedGradeProportion =
			targetGradeProportion * totalCountedWeightProportion -
			otherCountedCategoriesWeightedGradeProportion;

		const targetCategoryGradeProportion =
			targetCategoryWeightedGradeProportion / targetCategoryWeightProportion;

		const { pointsEarned: categoryOtherPointsEarned, pointsPossible: categoryOtherPointsPossible } =
			getAssignmentPointTotals(
				otherAssignments.filter((assignment) => assignment.category === assignmentCategoryName)
			);

		const categoryTotalPointsPossible = categoryOtherPointsPossible + assignmentPointsPossible;

		const assignmentPointsNeeded =
			targetCategoryGradeProportion * categoryTotalPointsPossible - categoryOtherPointsEarned;

		return assignmentPointsNeeded;
	} else {
		const { otherAssignments } = categoryDependentParams;

		const { pointsEarned: otherPointsEarned, pointsPossible: otherPointsPossible } =
			getAssignmentPointTotals(otherAssignments);

		const pointsPossible = assignmentPointsPossible + otherPointsPossible;

		const assignmentPointsNeeded = targetGradeProportion * pointsPossible - otherPointsEarned;

		return assignmentPointsNeeded;
	}
}
