import type { AttachmentResult } from '$lib/types/Attachment';
import type { AttendanceResult } from '$lib/types/Attendance';
import type { AuthTokenResult } from '$lib/types/AuthToken';
import type { DocumentsResult } from '$lib/types/Documents';
import type { MailResult } from '$lib/types/MailData';
import type { StudentInfoResult } from '$lib/types/StudentInfo';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import type { GradebookResult } from './types/Gradebook';
import type { ReportCardResult } from './types/ReportCard';

export const Operation = {
	Request: 'ProcessWebServiceRequest',
	RequestMultiWeb: 'ProcessWebServiceRequestMultiWeb'
} as const;

export type Operation = (typeof Operation)[keyof typeof Operation];

const MethodName = {
	Gradebook: 'Gradebook',
	Attendance: 'Attendance',
	StudentInfo: 'StudentInfo',
	Documents: 'GetStudentDocumentInitialData',
	ReportCard: 'GetReportCardDocumentData',
	Mail: 'SynergyMailGetData',
	Attachment: 'SynergyMailGetAttachment',
	GenerateAuthToken: 'GenerateAuthToken'
} as const;

type MethodName = (typeof MethodName)[keyof typeof MethodName];

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

export const unwrapEnvelope = (envelopeStr: string, operation: Operation): string =>
	envelopeParser.parse(envelopeStr)['soap:Envelope']['soap:Body'][`${operation}Response`][
		`${operation}Result`
	];

export const wrapEnvelope = (body: string, operation: Operation): string =>
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

export function parseResult<T>(resultStr: string): T {
	const result = resultParser.parse(resultStr);

	if (result.RT_ERROR) throw new Error(result.RT_ERROR._ERROR_MESSAGE);

	return result;
}

interface Credentials {
	domain: string;
	userID: string;
	password: string;
}

async function fetchSoap(
	operation: Operation,
	methodName: MethodName,
	{ domain, userID, password }: Credentials,
	params: Record<string, unknown> = {}
) {
	const res = await fetch(`https://${domain}/Service/PXPCommunication.asmx`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/soap+xml; charset=utf-8' },
		body: builder.build({
			'soap12:Envelope': {
				'_xmlns:soap12': 'http://www.w3.org/2003/05/soap-envelope',
				'soap12:Body': {
					[operation]: {
						_xmlns: 'http://edupoint.com/webservices/',
						userID,
						password,
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

async function soapRequest<T>(
	operation: Operation,
	methodName: MethodName,
	credentials: Credentials,
	params: Record<string, unknown> = {}
) {
	const res = await fetchSoap(operation, methodName, credentials, params);

	const envelopeStr = await res.text();

	const resultStr = unwrapEnvelope(envelopeStr, operation);

	return parseResult<T>(resultStr);
}

const webServiceRequest = <T>(
	methodName: MethodName,
	credentials: Credentials,
	params: Record<string, unknown> = {}
) => soapRequest<T>(Operation.Request, methodName, credentials, params);

const webServiceRequestMultiWeb = <T>(
	methodName: MethodName,
	credentials: Credentials,
	params: Record<string, unknown> = {}
) => soapRequest<T>(Operation.RequestMultiWeb, methodName, credentials, params);

export const parseGradebookXML = (resultStr: string) =>
	parseResult<GradebookResult>(resultStr).Gradebook;

export class StudentAccount {
	domain: string;
	userID: string;
	password: string;

	constructor(domain: string, userID: string, password: string) {
		this.domain = domain;
		this.userID = userID;
		this.password = password;
	}

	get credentials(): Credentials {
		return {
			domain: this.domain,
			userID: this.userID,
			password: this.password
		};
	}

	async checkLogin() {
		await webServiceRequest<StudentInfoResult>('StudentInfo', this.credentials);
	}

	async gradebookRequest(reportPeriod?: number) {
		// When a specific report period is requested, if it is not available Synergy returns the current report period
		const params = reportPeriod ? { ReportPeriod: reportPeriod } : undefined;

		return await fetchSoap(Operation.Request, MethodName.Gradebook, this.credentials, params);
	}

	async attendance() {
		return (await webServiceRequest<AttendanceResult>(MethodName.Attendance, this.credentials))
			.Attendance;
	}

	async studentInfo() {
		return (await webServiceRequest<StudentInfoResult>(MethodName.StudentInfo, this.credentials))
			.StudentInfo;
	}

	async documents() {
		return (await webServiceRequest<DocumentsResult>(MethodName.Documents, this.credentials))
			.StudentDocuments;
	}

	async reportCard(documentGU: string) {
		return (
			await webServiceRequest<ReportCardResult>(MethodName.ReportCard, this.credentials, {
				DocumentGU: documentGU
			})
		).DocumentData;
	}

	async mailData() {
		return (await webServiceRequest<MailResult>(MethodName.Mail, this.credentials))
			.SynergyMailDataXML;
	}

	async attachment(attachmentGU: string) {
		return (
			await webServiceRequest<AttachmentResult>(MethodName.Attachment, this.credentials, {
				SmAttachmentGU: attachmentGU
			})
		).AttachmentXML;
	}

	async getAuthToken() {
		return (
			await webServiceRequestMultiWeb<AuthTokenResult>('GenerateAuthToken', this.credentials, {
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
}
