import { parseSynergyAssignment, type RealAssignment } from '$lib/grades/assignments';
import type { AssignmentEntity } from '$lib/types/Gradebook';
import { expect, test } from 'bun:test';

test('Normal Assignment', () => {
	const synergyAssignment: AssignmentEntity = {
		Resources: '',
		Standards: '',
		_GradebookID: '123456',
		_Measure: 'Ch. 3 Quiz',
		_Type: 'Quiz',
		_Date: '1/1/2024',
		_DueDate: '1/1/2024',
		_DisplayScore: '3 out of 4',
		_ScoreCalValue: '3',
		_TimeSincePost: '4h',
		_TotalSecondsSincePost: '17554.6023012',
		_ScoreMaxValue: '4',
		_ScoreType: 'Raw Score',
		_Points: '3 / 4',
		_Point: '3',
		_PointPossible: '4',
		_Notes: '',
		_TeacherID: '11111',
		_StudentID: '22222',
		_MeasureDescription: '',
		_HasDropBox: 'false',
		_DropStartDate: '1/1/2024',
		_DropEndDate: '1/1/2024'
	};

	expect(parseSynergyAssignment(synergyAssignment)).toEqual({
		name: 'Ch. 3 Quiz',
		id: '123456',
		pointsEarned: 3,
		pointsPossible: 4,
		unscaledPoints: undefined,
		extraCredit: false,
		gradePercentageChange: undefined,
		notForGrade: false,
		hidden: false,
		category: 'Quiz',
		date: new Date('1/1/2024'),
		newHypothetical: false
	});
});

test('Normal Assignment - _Point is empty string', () => {
	const synergyAssignment: AssignmentEntity = {
		Resources: '',
		Standards: '',
		_GradebookID: '123456',
		_Measure: 'Ch. 3 Quiz',
		_Type: 'Quiz',
		_Date: '1/1/2024',
		_DueDate: '1/1/2024',
		_DisplayScore: '0 out of 4',
		_ScoreCalValue: '0',
		_TimeSincePost: '4h',
		_TotalSecondsSincePost: '17554.6023012',
		_ScoreMaxValue: '4',
		_ScoreType: 'Raw Score',
		_Points: '/ 4',
		_Point: '',
		_PointPossible: '4',
		_Notes: '',
		_TeacherID: '11111',
		_StudentID: '22222',
		_MeasureDescription: '',
		_HasDropBox: 'false',
		_DropStartDate: '1/1/2024',
		_DropEndDate: '1/1/2024'
	};

	expect(parseSynergyAssignment(synergyAssignment)).toEqual({
		name: 'Ch. 3 Quiz',
		id: '123456',
		pointsEarned: 0,
		pointsPossible: 4,
		unscaledPoints: undefined,
		extraCredit: false,
		gradePercentageChange: undefined,
		notForGrade: false,
		hidden: false,
		category: 'Quiz',
		date: new Date('1/1/2024'),
		newHypothetical: false
	});
});

test('Not Graded Assignment - Points Possible', () => {
	const synergyAssignment: AssignmentEntity = {
		Resources: '',
		Standards: '',
		_GradebookID: '123456',
		_Measure: 'Ch. 3 Quiz',
		_Type: 'Quiz',
		_Date: '1/1/2024',
		_DueDate: '1/1/2024',
		_DisplayScore: 'Not Graded',
		_TimeSincePost: '4h',
		_TotalSecondsSincePost: '17554.6023012',
		_ScoreMaxValue: '4',
		_ScoreType: 'Raw Score',
		_Points: '4 Points Possible',
		_Notes: '',
		_TeacherID: '11111',
		_StudentID: '22222',
		_MeasureDescription: '',
		_HasDropBox: 'false',
		_DropStartDate: '1/1/2024',
		_DropEndDate: '1/1/2024'
	};

	const match: RealAssignment = {
		name: 'Ch. 3 Quiz',
		id: '123456',
		pointsEarned: undefined,
		pointsPossible: 4,
		unscaledPoints: undefined,
		extraCredit: false,
		gradePercentageChange: undefined,
		notForGrade: false,
		hidden: false,
		category: 'Quiz',
		date: new Date('1/1/2024'),
		newHypothetical: false
	};

	expect(parseSynergyAssignment(synergyAssignment)).toEqual(match);

	synergyAssignment._ScoreMaxValue = undefined;

	expect(parseSynergyAssignment(synergyAssignment)).toEqual(match);
});

test('Not Graded Assignment - No Points Possible', () => {
	const synergyAssignment: AssignmentEntity = {
		Resources: '',
		Standards: '',
		_GradebookID: '123456',
		_Measure: 'Ch. 3 Quiz',
		_Type: 'Quiz',
		_Date: '1/1/2024',
		_DueDate: '1/1/2024',
		_DisplayScore: 'Not Graded',
		_TimeSincePost: '4h',
		_TotalSecondsSincePost: '17554.6023012',
		_ScoreType: 'Raw Score',
		_Points: 'Points Possible',
		_Notes: '',
		_TeacherID: '11111',
		_StudentID: '22222',
		_MeasureDescription: '',
		_HasDropBox: 'false',
		_DropStartDate: '1/1/2024',
		_DropEndDate: '1/1/2024'
	};

	expect(parseSynergyAssignment(synergyAssignment)).toEqual({
		name: 'Ch. 3 Quiz',
		id: '123456',
		pointsEarned: undefined,
		pointsPossible: undefined,
		unscaledPoints: undefined,
		extraCredit: false,
		gradePercentageChange: undefined,
		notForGrade: false,
		hidden: false,
		category: 'Quiz',
		date: new Date('1/1/2024'),
		newHypothetical: false
	});
});

test('Extra Credit Assignment', () => {
	const synergyAssignment: AssignmentEntity = {
		Resources: '',
		Standards: '',
		_GradebookID: '123456',
		_Measure: 'Ch. 3 Quiz',
		_Type: 'Quiz',
		_Date: '1/1/2024',
		_DueDate: '1/1/2024',
		_DisplayScore: '3 out of 4',
		_ScoreCalValue: '3',
		_TimeSincePost: '4h',
		_TotalSecondsSincePost: '17554.6023012',
		_ScoreMaxValue: '4',
		_ScoreType: 'Raw Score',
		_Points: '3 /',
		_Point: '3',
		_PointPossible: '',
		_Notes: '',
		_TeacherID: '11111',
		_StudentID: '22222',
		_MeasureDescription: '',
		_HasDropBox: 'false',
		_DropStartDate: '1/1/2024',
		_DropEndDate: '1/1/2024'
	};

	expect(parseSynergyAssignment(synergyAssignment)).toEqual({
		name: 'Ch. 3 Quiz',
		id: '123456',
		pointsEarned: 3,
		pointsPossible: 4,
		unscaledPoints: undefined,
		extraCredit: true,
		gradePercentageChange: undefined,
		notForGrade: false,
		hidden: false,
		category: 'Quiz',
		date: new Date('1/1/2024'),
		newHypothetical: false
	});
});

test('Not For Grading Assignment', () => {
	const synergyAssignment: AssignmentEntity = {
		Resources: '',
		Standards: '',
		_GradebookID: '123456',
		_Measure: 'Ch. 3 Quiz',
		_Type: 'Quiz',
		_Date: '1/1/2024',
		_DueDate: '1/1/2024',
		_DisplayScore: '3 out of 4',
		_ScoreCalValue: '3',
		_TimeSincePost: '4h',
		_TotalSecondsSincePost: '17554.6023012',
		_ScoreMaxValue: '4',
		_ScoreType: 'Raw Score',
		_Points: '3 / 4',
		_Point: '3',
		_PointPossible: '4',
		_Notes: '(Not For Grading)',
		_TeacherID: '11111',
		_StudentID: '22222',
		_MeasureDescription: '',
		_HasDropBox: 'false',
		_DropStartDate: '1/1/2024',
		_DropEndDate: '1/1/2024'
	};

	expect(parseSynergyAssignment(synergyAssignment)).toEqual({
		name: 'Ch. 3 Quiz',
		id: '123456',
		pointsEarned: 3,
		pointsPossible: 4,
		unscaledPoints: undefined,
		extraCredit: false,
		gradePercentageChange: undefined,
		notForGrade: true,
		hidden: false,
		category: 'Quiz',
		date: new Date('1/1/2024'),
		newHypothetical: false
	});
});

test('Scaled Assignment', () => {
	const synergyAssignment: AssignmentEntity = {
		Resources: '',
		Standards: '',
		_GradebookID: '123456',
		_Measure: 'Ch. 3 Quiz',
		_Type: 'Quiz',
		_Date: '1/1/2024',
		_DueDate: '1/1/2024',
		_DisplayScore: '3 out of 4',
		_ScoreCalValue: '3',
		_TimeSincePost: '4h',
		_TotalSecondsSincePost: '17554.6023012',
		_ScoreMaxValue: '4',
		_ScoreType: 'Raw Score',
		_Points: '6 / 8',
		_Point: '6',
		_PointPossible: '8',
		_Notes: '',
		_TeacherID: '11111',
		_StudentID: '22222',
		_MeasureDescription: '',
		_HasDropBox: 'false',
		_DropStartDate: '1/1/2024',
		_DropEndDate: '1/1/2024'
	};

	expect(parseSynergyAssignment(synergyAssignment)).toEqual({
		name: 'Ch. 3 Quiz',
		id: '123456',
		pointsEarned: 6,
		pointsPossible: 8,
		unscaledPoints: {
			pointsEarned: 3,
			pointsPossible: 4
		},
		extraCredit: false,
		gradePercentageChange: undefined,
		notForGrade: false,
		hidden: false,
		category: 'Quiz',
		date: new Date('1/1/2024'),
		newHypothetical: false
	});
});
