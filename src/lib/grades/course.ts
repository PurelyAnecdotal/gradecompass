import type { Course } from '$lib/types/Gradebook';
import type { Category } from './assignments';
import { seenAssignmentIDs } from './seenAssignments.svelte';

const getMark = (course: Course) => course.Marks?.Mark[0];

export function getCourseGrade(course: Course) {
	const mark = getMark(course);
	if (!mark) return;

	return {
		letter: mark._CalculatedScoreString,
		percentage: parseFloat(mark._CalculatedScoreRaw ?? '0')
	};
}

export const getSynergyCourseAssignmentCategories = (course: Course): Category[] | undefined =>
	getMark(course)?.GradeCalculationSummary?.AssignmentGradeCalc.map((category) => ({
		name: category._Type,
		weightPercentage: parseFloat(category._Weight),
		pointsEarned: parseFloat(category._Points),
		pointsPossible: parseFloat(category._PointsPossible),
		weightedPercentage: parseFloat(category._WeightedPct),
		gradeLetter: category._CalculatedMark
	}));

export const getCourseUnseenAssignmentsCount = (course: Course) =>
	getMark(course)?.Assignments?.Assignment.filter(
		({ _GradebookID: id }) => !seenAssignmentIDs.has(id)
	).length ?? 0;

export function clearCourseUnseenAssignments(course: Course) {
	getMark(course)?.Assignments?.Assignment.forEach(({ _GradebookID: id }) =>
		seenAssignmentIDs.add(id)
	);
}
