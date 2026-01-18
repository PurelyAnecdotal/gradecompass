export interface Gradebook {
	ReportingPeriods: ReportingPeriods;
	ReportingPeriod: ReportPeriod;
	Courses: Courses;
	'_xmlns:xsd': string;
	'_xmlns:xsi': string;
	_Type: string;
	_ErrorMessage: string;
	_HideStandardGraphInd: string;
	_HideMarksColumnElementary: string;
	_HidePointsColumnElementary: string;
	_HidePercentSecondary: string;
	_DisplayStandardsData: string;
	_GBStandardsTabDefault: string;
}

export interface ReportingPeriods {
	ReportPeriod: ReportPeriod[];
}

export interface ReportPeriod {
	_GradePeriod: string;
	_Index: string;
	_StartDate: string;
	_EndDate: string;
}

export interface Courses {
	Course: Course[];
}

export interface Course {
	Marks: Marks | '';
	_Period: string;
	_Title: string;
	_CourseName: string;
	_CourseID: string;
	_Room: string;
	_Staff: string;
	_StaffEMail: string;
	_StaffGU: string;
	_ImageType: string;
	_HighlightPercentageCutOffForProgressBar: string;
	_UsesRichContent: string;
}

export interface Marks {
	Mark: Mark;
}

export interface Mark {
	StandardViews: string;
	GradeCalculationSummary: GradeCalculationSummaryClass | string;
	Assignments: Assignments;
	AssignmentsSinceLastAccess: Assignments | string;
	_MarkName: string;
	_ShortMarkName: string;
	_CalculatedScoreString: string;
	_CalculatedScoreRaw: string;
}

export interface Assignments {
	Assignment?: AssignmentEntity[];
}

export interface AssignmentEntity {
	Resources: ResourcesClass | string;
	Standards: string;
	_GradebookID: string;
	_Measure: string;
	_Type: string;
	_Date: string;
	_DueDate: string;
	_DisplayScore: string;
	_ScoreCalValue?: string;
	_TimeSincePost: string;
	_TotalSecondsSincePost: string;
	_ScoreMaxValue?: string;
	_ScoreType: 'Raw Score';
	_Points: string;
	_Point?: string;
	_PointPossible?: string;
	_Notes: string; // Teacher comments
	_TeacherID: string;
	_StudentID: string;
	_MeasureDescription: string;
	_HasDropBox: string;
	_DropStartDate: string;
	_DropEndDate: string;
}

export interface ResourcesClass {
	Resource: ResourceElement[] | ResourceElement;
}

export interface ResourceElement {
	_Type: Type;
	_ClassID: string;
	_GradebookID: string;
	_ResourceDate: Date;
	_ResourceDescription: string;
	_ResourceID: string;
	_ResourceName: string;
	_Sequence: string;
	_TeacherID: string;
	_url: string;
	_ServerFileName: string;
	_FileType?: FileType;
}

export enum FileType {
	ApplicationVndGoogleAppsFile = 'application/vnd.google-apps.file'
}

export enum Type {
	URL = 'URL'
}

export interface GradeCalculationSummaryClass {
	AssignmentGradeCalc: AssignmentGradeCalc[];
}

export interface AssignmentGradeCalc {
	_Type: string;
	_Weight: string;
	_Points: string;
	_PointsPossible: string;
	_WeightedPct: string;
	_CalculatedMark: string;
}
