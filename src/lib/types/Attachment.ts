export interface AttachmentResult {
	AttachmentXML: Attachment;
}

export interface Attachment {
	Base64Code: string;
	'_xmlns:xsd': string;
	'_xmlns:xsi': string;
	_SmAttachmentGU: string;
	_DocumentName: string;
}
