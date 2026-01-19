import { LocalStorageKey } from '$lib';
import { acc } from '$lib/account.svelte';
import { Operation, parseGradebookXML, unwrapEnvelope } from '$lib/synergy';
import type { ReportPeriod } from '$lib/types/Gradebook';

interface GradebookRecord {
	xml: string;
	lastRefresh: number;
}

interface GradebookCatalogLocalStorageCache {
	recordCache: (null | GradebookRecord)[];
	defaultIndex: number;
	overrideIndex: number | null;
}

export interface GradebookCatalog {
	recordCache: (undefined | GradebookRecord)[];
	defaultIndex: number;
	overrideIndex?: number;
	loadingIndex?: number;
	receivingData?: boolean;
	canonicalReportPeriodEntries?: ReportPeriod[];
}

export function getGradebookCatalogFromLocalStorage() {
	const cacheStr = localStorage.getItem(LocalStorageKey.gradebook);
	if (cacheStr === null) return undefined;

	const cache: GradebookCatalogLocalStorageCache = JSON.parse(cacheStr);

	const defaultRecord = cache.recordCache[cache.defaultIndex];

	const canonicalReportPeriodEntries = defaultRecord
		? parseGradebookXML(defaultRecord.xml).ReportingPeriods.ReportPeriod
		: undefined;

	const gradebookCatalog: GradebookCatalog = {
		recordCache: cache.recordCache.map((record) => record ?? undefined),
		defaultIndex: cache.defaultIndex,
		overrideIndex: cache.overrideIndex ?? undefined,
		canonicalReportPeriodEntries
	};
	return gradebookCatalog;
}

export function saveGradebookCatalogToLocalStorage(gradebookCatalog: GradebookCatalog) {
	const cache: GradebookCatalogLocalStorageCache = {
		recordCache: gradebookCatalog.recordCache.map((record) => record ?? null),
		defaultIndex: gradebookCatalog.defaultIndex,
		overrideIndex: gradebookCatalog.overrideIndex ?? null
	};

	localStorage.setItem(LocalStorageKey.gradebook, JSON.stringify(cache));
}

export async function getGradebookRecord(onReceivingData?: () => void, reportPeriod?: number) {
	const { studentAccount } = acc;
	if (!studentAccount) throw new Error('Cannot get synergy gradebook: student account not loaded');

	const res = await studentAccount.gradebookRequest(reportPeriod);

	onReceivingData?.();

	const envelopeStr = await res.text();

	const record: GradebookRecord = {
		xml: unwrapEnvelope(envelopeStr, Operation.Request),
		lastRefresh: Date.now()
	};
	return record;
}

export async function getInitialGradebookCatalog() {
	const defaultGradebookRecord = await getGradebookRecord();

	const defaultGradebook = parseGradebookXML(defaultGradebookRecord.xml);

	const canonicalReportPeriodEntries = defaultGradebook.ReportingPeriods.ReportPeriod;

	const reportingPeriods: (undefined | GradebookRecord)[] = Array(
		canonicalReportPeriodEntries.length
	).fill(undefined);

	const defaultIndex = parseInt(defaultGradebook.ReportingPeriod._Index);

	reportingPeriods[defaultIndex] = defaultGradebookRecord;

	const gradebookCatalog: GradebookCatalog = {
		recordCache: reportingPeriods,
		defaultIndex,
		canonicalReportPeriodEntries
	};
	return gradebookCatalog;
}

const cacheExpirationTime = 1000 * 60 * 5;

export const gradebookRefreshNeeded = (record: GradebookRecord) =>
	Date.now() - record.lastRefresh > cacheExpirationTime;
