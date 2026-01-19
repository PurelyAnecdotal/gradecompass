#!/usr/bin/env bun

import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as readline from 'node:readline';
import { unwrapEnvelope, type Operation } from './src/lib/synergy';

async function prompt(question: string): Promise<string> {
	const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			rl.close();
			resolve(answer.trim());
		});
	});
}

const builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '_' });

const parser = new XMLParser({
	ignoreAttributes: false,
	ignoreDeclaration: true,
	attributeNamePrefix: '_'
});

async function soapRequest(
	domain: string,
	userID: string,
	password: string,
	methodName: string,
	params: Map<string, unknown> = new Map(),
	operation: Operation = 'ProcessWebServiceRequest'
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
						paramStr: builder.build({ Params: Object.fromEntries(params) })
					}
				}
			}
		})
	});

	if (res.status !== 200) throw new Error(`HTTP ${res.status} when requesting ${operation}`);

	const envelopeStr = await res.text();

	const resultStr = unwrapEnvelope(envelopeStr, operation);

	{
		const result = parser.parse(resultStr);

		if (result.RT_ERROR) throw new Error(result.RT_ERROR._ERROR_MESSAGE);
	}

	return resultStr;
}

async function generateMethodMockData(
	methodName: string,
	fileName: string,
	params: Map<string, unknown> = new Map()
) {
	try {
		const resultStr = await soapRequest(domain, username, password, methodName, params);

		const outputPath = path.join(process.cwd(), 'src', 'lib', 'mocks', 'data', fileName);
		await fs.writeFile(outputPath, resultStr, 'utf-8');

		console.log(`Saved ${fileName}`);
	} catch (error) {
		console.error(`Failed to fetch ${methodName}:`, error);
	}
}

const domain = process.env.STUDENTVUE_DOMAIN ?? (await prompt('StudentVUE Domain: '));
const username = process.env.STUDENTVUE_USERNAME ?? (await prompt('StudentVUE Username: '));
const password = process.env.STUDENTVUE_PASSWORD ?? (await prompt('StudentVUE Password: '));

console.log(`Connecting to ${domain} as ${username}\n`);

const outputDir = path.join(process.cwd(), 'src', 'lib', 'mocks', 'data');
if (!(await fs.exists(outputDir))) await fs.mkdir(outputDir, { recursive: true });

const documentGU =
	process.env.STUDENTVUE_MOCK_DOCUMENT_GU ?? (await prompt('Example DocumentGU to mock: '));

const attachmentGU =
	process.env.STUDENTVUE_MOCK_ATTACHMENT_GU ?? (await prompt('Example AttachmentGU to mock: '));

const reportPeriod = process.env.STUDENTVUE_MOCK_REPORT_PERIOD;

const gradebookParams: Map<string, string> =
	reportPeriod !== undefined ? new Map([['ReportPeriod', reportPeriod]]) : new Map();

const resources: ([string, string] | [string, string, Map<string, unknown>])[] = [
	['Gradebook', 'Gradebook.xml', gradebookParams],
	['Attendance', 'Attendance.xml'],
	['GetStudentDocumentInitialData', 'StudentDocuments.xml'],
	['GetReportCardDocumentData', 'DocumentData.xml', new Map([['DocumentGU', documentGU]])],
	['SynergyMailGetData', 'SynergyMailDataXML.xml'],
	['SynergyMailGetAttachment', 'AttachmentXML.xml', new Map([['SmAttachmentGU', attachmentGU]])],
	['StudentInfo', 'StudentInfo.xml']
];

await Promise.allSettled(
	resources.map(([methodName, fileName, params]) =>
		generateMethodMockData(methodName, fileName, params)
	)
);

console.log('\nMock data generation complete');
