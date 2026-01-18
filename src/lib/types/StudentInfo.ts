export interface StudentInfoResult {
	StudentInfo: StudentInfo;
}

export interface StudentInfo {
	FormattedName: string;
	PermID: number;
	Gender: string;
	Grade: number;
	Photo: string;
	'_xmlns:xsd': string;
	'_xmlns:xsi': string;
	_Type: string;
	_ShowPhysicianAndDentistInfo: string;
}
