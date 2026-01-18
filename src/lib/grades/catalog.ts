import { LocalStorageKey, type LocalStorageCache } from '$lib';
import { acc } from '$lib/account.svelte';
import type { Gradebook } from '$lib/types/Gradebook';

interface GradebookCatalogLocalStorageCache {
	reportingPeriods: (null | LocalStorageCache<Gradebook>)[];
	defaultIndex: number;
	overrideIndex: number | null;
}

export interface GradebookCatalog {
	reportingPeriods: (undefined | GradebookRecord)[];
	defaultIndex: number;
	overrideIndex?: number;
	loadingIndex?: number;
	receivingData?: boolean;
}

export interface GradebookRecord {
	data: Gradebook;
	lastRefresh: number;
}

export function getGradebookCatalogFromLocalStorage() {
	const cacheStr = localStorage.getItem(LocalStorageKey.gradebook);
	if (cacheStr === null) return undefined;

	const cache: GradebookCatalogLocalStorageCache = JSON.parse(cacheStr);

	const gradebookCatalog: GradebookCatalog = {
		reportingPeriods: cache.reportingPeriods.map((lsCache) => lsCache ?? undefined),
		defaultIndex: cache.defaultIndex,
		overrideIndex: cache.overrideIndex ?? undefined
	};
	return gradebookCatalog;
}

export function saveGradebookCatalogToLocalStorage(gradebookCatalog: GradebookCatalog) {
	const cache: GradebookCatalogLocalStorageCache = {
		reportingPeriods: gradebookCatalog.reportingPeriods.map((record) => {
			if (!record) return null;
			return { data: record.data, lastRefresh: record.lastRefresh };
		}),
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

	const record: GradebookRecord = {
		data: await studentAccount.gradebookParse(res),
		lastRefresh: Date.now()
	};
	return record;
}

export async function getInitialGradebookCatalog() {
	const defaultGradebookRecord = await getGradebookRecord();

	const defaultGradebook = defaultGradebookRecord.data;

	const reportingPeriods: (undefined | GradebookRecord)[] = Array(
		defaultGradebook.ReportingPeriods.ReportPeriod.length
	).fill(undefined);

	const defaultIndex = parseInt(defaultGradebook.ReportingPeriod._Index);

	reportingPeriods[defaultIndex] = defaultGradebookRecord;

	const gradebookCatalog: GradebookCatalog = {
		reportingPeriods,
		defaultIndex
	};
	return gradebookCatalog;
}

export const getActiveGradebookRecordFromCatalog = (gradebookCatalog: GradebookCatalog) =>
	gradebookCatalog.reportingPeriods[
		gradebookCatalog.overrideIndex ?? gradebookCatalog.defaultIndex
	];

export const getDefaultGradebookRecordFromCatalog = (gradebookCatalog: GradebookCatalog) =>
	gradebookCatalog.reportingPeriods[gradebookCatalog.defaultIndex];

const cacheExpirationTime = 1000 * 60 * 5;

export const gradebookRefreshNeeded = (record: GradebookRecord) =>
	Date.now() - record.lastRefresh > cacheExpirationTime;
