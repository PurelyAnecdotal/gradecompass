export interface DocumentsResult {
	StudentDocuments: Documents;
}

export interface Documents {
	StudentDocumentDatas: StudentDocumentDatas;
	'_xmlns:xsd': string;
	'_xmlns:xsi': string;
	_showDateColumn: string;
	_showDocNameColumn: string;
	_showDocCatColumn: string;
	_StudentGU: string;
	_StudentSSY: string;
}

export interface StudentDocumentDatas {
	StudentDocumentData?: StudentDocumentData[] | null;
}

export interface StudentDocumentData {
	_DocumentGU: string;
	_DocumentFileName: string;
	_DocumentDate: string;
	_DocumentType: string;
	_StudentGU: string;
	_DocumentComment: string;
}
