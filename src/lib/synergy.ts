import type { Attachment } from '$lib/types/Attachment';
import type { Attendance } from '$lib/types/Attendance';
import type { AuthToken } from '$lib/types/AuthToken';
import type { Documents } from '$lib/types/Documents';
import type { Gradebook } from '$lib/types/Gradebook';
import type { MailData } from '$lib/types/MailData';
import type { ReportCard } from '$lib/types/ReportCard';
import type { StudentInfo } from '$lib/types/StudentInfo';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';

const alwaysArray = [
	'Gradebook.Courses.Course',
	'Gradebook.Courses.Course.Marks.Mark.Assignments.Assignment',
	'Gradebook.ReportingPeriods.ReportPeriod',
	'Attendance.Absences.Absence'
];

const envelopeParser = new XMLParser({ ignoreDeclaration: true });

const resultParser = new XMLParser({
	ignoreAttributes: false,
	ignoreDeclaration: true,
	attributeNamePrefix: '_',
	isArray: (_name, jpath) => alwaysArray.includes(jpath)
});

const builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '_' });

export const unwrapEnvelope = (
	envelopeStr: string,
	operation = 'ProcessWebServiceRequest'
): string =>
	envelopeParser.parse(envelopeStr)['soap:Envelope']['soap:Body'][`${operation}Response`][
		`${operation}Result`
	];

export const wrapEnvelope = (body: string, operation = 'ProcessWebServiceRequest'): string =>
	builder.build({
		'?xml': { _version: '1.0', _encoding: 'utf-8' },
		'soap:Envelope': {
			'_xmlns:soap': 'http://www.w3.org/2003/05/soap-envelope',
			'_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
			'_xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
			'soap:Body': {
				[`${operation}Response`]: {
					_xmlns: 'http://edupoint.com/webservices/',
					[`${operation}Result`]: body
				}
			}
		}
	});

export class StudentAccount {
	domain: string;
	userID: string;
	password: string;

	constructor(domain: string, userID: string, password: string) {
		this.domain = domain;
		this.userID = userID;
		this.password = password;
	}

	async soapRequest(operation: string, methodName: string, params: Record<string, unknown> = {}) {
		const res = await fetch(`https://${this.domain}/Service/PXPCommunication.asmx`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/soap+xml; charset=utf-8' },
			body: builder.build({
				'soap12:Envelope': {
					'_xmlns:soap12': 'http://www.w3.org/2003/05/soap-envelope',
					'soap12:Body': {
						[operation]: {
							_xmlns: 'http://edupoint.com/webservices/',
							userID: this.userID,
							password: this.password,
							skipLoginLog: true,
							parent: false,
							webServiceHandleName: 'PXPWebServices',
							methodName,
							paramStr: builder.build({ Params: params })
						}
					}
				}
			})
		});

		if (res.status !== 200) throw new Error(`HTTP ${res.status} when requesting ${operation}`);

		return res;
	}

	async soapParse(res: Response, operation: string) {
		const envelopeStr = await res.text();

		const resultStr = unwrapEnvelope(envelopeStr, operation);

		const result = resultParser.parse(resultStr);

		if (result.RT_ERROR) throw new Error(result.RT_ERROR._ERROR_MESSAGE);

		return result;
	}

	async request(methodName: string, params: Record<string, unknown> = {}) {
		const res = await this.soapRequest('ProcessWebServiceRequest', methodName, params);
		return await this.soapParse(res, 'ProcessWebServiceRequest');
	}

	async requestMultiWeb(methodName: string, params: Record<string, unknown> = {}) {
		const res = await this.soapRequest('ProcessWebServiceRequestMultiWeb', methodName, params);
		return await this.soapParse(res, 'ProcessWebServiceRequestMultiWeb');
	}

	async checkLogin() {
		await this.request('StudentInfo');
	}

	async getAuthToken(): Promise<AuthToken> {
		return (
			await this.requestMultiWeb('GenerateAuthToken', {
				Username: this.userID,
				TokenForClassWebSite: true,
				Usertype: 0,
				IsParentStudent: 0,
				DataString: '',
				DocumentID: 1,
				AssignmentID: 1
			})
		).AuthToken;
	}

	async gradebookRequest(reportPeriod?: number): Promise<Response> {
		// When a specific report period is requested, if it is not available Synergy returns the current report period
		const params = reportPeriod ? { ReportPeriod: reportPeriod } : undefined;

		return await this.soapRequest('ProcessWebServiceRequest', 'Gradebook', params);
	}

	async gradebookParse(res: Response): Promise<Gradebook> {
		return (await this.soapParse(res, 'ProcessWebServiceRequest')).Gradebook;
	}

	async attendance(): Promise<Attendance> {
		return (await this.request('Attendance')).Attendance;
	}

	async studentInfo(): Promise<StudentInfo> {
		return (await this.request('StudentInfo')).StudentInfo;
	}

	async documents(): Promise<Documents> {
		return (await this.request('GetStudentDocumentInitialData')).StudentDocuments;
	}

	async reportCard(documentGU: string): Promise<ReportCard> {
		return (await this.request('GetReportCardDocumentData', { DocumentGU: documentGU }))
			.DocumentData;
	}

	async mailData(): Promise<MailData> {
		return (await this.request('SynergyMailGetData')).SynergyMailDataXML;
	}

	async attachment(attachmentGU: string): Promise<Attachment> {
		return (await this.request('SynergyMailGetAttachment', { SmAttachmentGU: attachmentGU }))
			.AttachmentXML;
	}
}
