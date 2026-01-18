export interface ReportCardResult {
	DocumentData: ReportCard | ReportCardNotFound;
}

export interface ReportCardNotFound {
	'_xmlns:xsd': string;
	'_xmlns:xsi': string;
}

export interface ReportCard extends ReportCardNotFound {
	Base64Code: string;
	_DocumentGU: string;
	_FileName: string;
	_DocFileName: string;
	_DocType: string;
}
