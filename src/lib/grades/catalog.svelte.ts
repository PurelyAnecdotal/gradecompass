import { LocalStorageKey } from '$lib';
import { loadStudentAccount } from '$lib/account.svelte';
import { parseGradebookXML } from '$lib/synergy';
import { toast } from 'svelte-sonner';
import {
	getGradebookCatalogFromLocalStorage,
	getGradebookRecord,
	getInitialGradebookCatalog,
	gradebookRefreshNeeded,
	saveGradebookCatalogToLocalStorage,
	type GradebookCatalog
} from './catalog';
import { saveSeenAssignmentsToLocalStorage } from './seenAssignments';
import { seenAssignmentIDs } from './seenAssignments.svelte';

export const gradebookState = $state({}) as {
	gradebookCatalog?: GradebookCatalog;
	loadingError?: unknown;
};

export const getReportPeriodName = (index: number) =>
	gradebookState.gradebookCatalog?.canonicalReportPeriodEntries?.[index]?._GradePeriod ??
	`Report Period ${index}`;

const onReceivingData = () => {
	if (!gradebookState.gradebookCatalog) return;
	gradebookState.gradebookCatalog.receivingData = true;
};

export async function switchReportPeriod({
	overrideIndex,
	forceRefresh
}: {
	overrideIndex?: number;
	forceRefresh?: boolean;
} = {}) {
	if (!gradebookState.gradebookCatalog)
		throw new Error(`Cannot switch report periods: gradebook catalog not initialized`);

	const requestedIndex = overrideIndex ?? gradebookState.gradebookCatalog.defaultIndex;
	gradebookState.gradebookCatalog.loadingIndex = requestedIndex;

	const record = gradebookState.gradebookCatalog.recordCache[requestedIndex];

	if (record) setReportPeriodIndex(overrideIndex ?? gradebookState.gradebookCatalog.defaultIndex);

	if (forceRefresh || !record || gradebookRefreshNeeded(record)) {
		gradebookState.gradebookCatalog.receivingData = false;
		const gradebookRecord = await getGradebookRecord(onReceivingData, overrideIndex);

		const gradebook = parseGradebookXML(gradebookRecord.xml);

		const receivedIndex = parseInt(gradebook.ReportingPeriod._Index);

		gradebookState.gradebookCatalog.recordCache[receivedIndex] = gradebookRecord;

		if (overrideIndex === undefined) {
			gradebookState.gradebookCatalog.defaultIndex = receivedIndex;
			gradebookState.gradebookCatalog.canonicalReportPeriodEntries =
				gradebook.ReportingPeriods.ReportPeriod;
		}

		if (receivedIndex !== requestedIndex) {
			if (overrideIndex === undefined) {
				toast.info(`${gradebook.ReportingPeriod._GradePeriod} is now the default`, {
					description: `${getReportPeriodName(requestedIndex)} may still be viewable`,
					duration: 6000
				});
			} else {
				toast.error(`${getReportPeriodName(requestedIndex)} is not available`, {
					duration: 6000
				});
			}
		} else {
			gradebookState.gradebookCatalog.overrideIndex =
				overrideIndex !== gradebookState.gradebookCatalog.defaultIndex ? overrideIndex : undefined;
		}
	} else {
		setReportPeriodIndex(overrideIndex ?? gradebookState.gradebookCatalog.defaultIndex);
	}

	gradebookState.gradebookCatalog.loadingIndex = undefined;
	saveGradebookCatalogToLocalStorage(gradebookState.gradebookCatalog);
}

function setReportPeriodIndex(index: number) {
	if (!gradebookState.gradebookCatalog)
		throw new Error(`Cannot set report period index: gradebook catalog not initialized`);

	gradebookState.gradebookCatalog.overrideIndex =
		index !== gradebookState.gradebookCatalog.defaultIndex ? index : undefined;
}

async function getGradebookCatalog() {
	let lsCache: GradebookCatalog | undefined;
	try {
		lsCache = getGradebookCatalogFromLocalStorage();
	} catch (error) {
		console.error('Error loading gradebook cache:', error);
		toast.warning('Failed to load saved gradebook data; refreshing', {
			description: error instanceof Error ? error.message : String(error),
			duration: 6000
		});
		localStorage.removeItem(LocalStorageKey.gradebook);
	}

	return lsCache ?? (await getInitialGradebookCatalog());
}

let initialized = false;

export async function initializeGradebookCatalog() {
	if (initialized) return;

	try {
		loadStudentAccount();

		gradebookState.gradebookCatalog = await getGradebookCatalog();

		// If there aren't any seen assignment ids saved, mark all assignments as seen
		if (seenAssignmentIDs.size === 0) {
			gradebookState.gradebookCatalog.recordCache
				.filter((record) => record !== undefined)
				.flatMap((record) => parseGradebookXML(record.xml).Courses.Course)
				.map((course) => course.Marks)
				.filter((marks) => marks !== '')
				.map((marks) => marks.Mark.Assignments.Assignment)
				.filter((assignments) => assignments !== undefined)
				.flat()
				.forEach((assignment) => seenAssignmentIDs.add(assignment._GradebookID));

			saveSeenAssignmentsToLocalStorage(seenAssignmentIDs);
		}

		const { overrideIndex } = gradebookState.gradebookCatalog;

		if (overrideIndex !== undefined) {
			try {
				await switchReportPeriod({ overrideIndex });
			} catch (error) {
				console.error(
					`Error loading override report period ${overrideIndex}; reverting to default`,
					error
				);
				toast.error(
					`Failed to load grades from ${getReportPeriodName(overrideIndex)}; loading default period instead`,
					{ description: error instanceof Error ? error.message : String(error), duration: 6000 }
				);

				await switchReportPeriod();
			}
		} else {
			await switchReportPeriod();
		}
	} catch (error) {
		console.error('Error loading grades:', error);
		gradebookState.loadingError = error;
	} finally {
		initialized = true;
	}
}
