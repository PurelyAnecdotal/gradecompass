import { LocalStorageKey, type LocalStorageCache, type RecordState } from '$lib';
import { acc } from '$lib/account.svelte';
import type { Gradebook, ReportPeriod } from '$lib/types/Gradebook';
import { saveSeenAssignmentsToLocalStorage } from './seenAssignments';
import { seenAssignmentIDs } from './seenAssignments.svelte';

interface GradebooksLocalStorageCache {
	records: (null | LocalStorageCache<Gradebook>)[];
	activeIndex: number;
	overrideIndex?: number;
}

interface GradebooksState {
	records?: (undefined | RecordState<Gradebook>)[];
	activeIndex?: number;
	overrideIndex?: number;
}

export const gradebooksState: GradebooksState = $state({});

export const getCurrentGradebookState = (gradebooksState: GradebooksState) =>
	gradebooksState.records && gradebooksState.activeIndex !== undefined
		? gradebooksState.records[gradebooksState.overrideIndex ?? gradebooksState.activeIndex]
		: undefined;

const cacheExpirationTime = 1000 * 60 * 5;

export const getPeriodIndex = (period: ReportPeriod, periods: ReportPeriod[]) =>
	periods.map((period) => period._GradePeriod).findIndex((name) => name === period._GradePeriod);

const saveGradebooksState = () => {
	if (!gradebooksState.records || gradebooksState.activeIndex === undefined)
		throw new Error('Gradebook state not initialized before saving');

	const cache: GradebooksLocalStorageCache = {
		records: gradebooksState.records.map((record) => {
			if (!record || !record.data || record.lastRefresh === undefined) return null;

			return { data: record.data, lastRefresh: record.lastRefresh };
		}),
		activeIndex: gradebooksState.activeIndex,
		overrideIndex: gradebooksState.overrideIndex
	};

	localStorage.setItem(LocalStorageKey.gradebook, JSON.stringify(cache));
};

export const loadGradebooks = async () => {
	const { studentAccount } = acc;
	if (!studentAccount || gradebooksState.records || gradebooksState.activeIndex !== undefined)
		return;

	// Try to load the state from the localStorage cache
	const cacheStr = localStorage.getItem(LocalStorageKey.gradebook);
	if (cacheStr !== null) {
		try {
			const cache: GradebooksLocalStorageCache = JSON.parse(cacheStr);

			gradebooksState.records = cache.records.map((lsCache) => {
				if (lsCache === null) return undefined;

				const record: RecordState<Gradebook> = {
					data: lsCache.data,
					loaded: false,
					lastRefresh: lsCache.lastRefresh
				};

				return record;
			});
			gradebooksState.activeIndex = cache.activeIndex;
			gradebooksState.overrideIndex = cache.overrideIndex;
		} catch (error) {
			console.error(error);
			localStorage.removeItem(LocalStorageKey.gradebook);
		}
	}

	// If the state hasn't been initalized yet (e.g. if localStorage was cleared)
	if (gradebooksState.activeIndex === undefined || gradebooksState.records === undefined) {
		// Request the active gradebook to get the active index
		const activeGradebook = await studentAccount.gradebook();

		const activeIndex = getPeriodIndex(
			activeGradebook.ReportingPeriod,
			activeGradebook.ReportingPeriods.ReportPeriod
		);
		gradebooksState.activeIndex = activeIndex;

		// Initialize the records array (will be undefined at first)
		gradebooksState.records ??= Array(activeGradebook.ReportingPeriods.ReportPeriod.length).fill(
			undefined
		);

		// Save the active gradebook to the records array
		gradebooksState.records[activeIndex] = {
			data: activeGradebook,
			loaded: true,
			lastRefresh: Date.now()
		};
	}

	// Load the gradebook currently being viewed
	await showGradebook(gradebooksState.overrideIndex);

	// Save the state to localStorage
	saveGradebooksState();

	// If there aren't any seen assignment ids saved, mark all assignments as seen
	if (seenAssignmentIDs.size === 0) {
		gradebooksState.records.forEach((record) =>
			record?.data?.Courses.Course.map((course) => course.Marks)
				.filter((marks) => marks !== '')
				.forEach((marks) =>
					marks.Mark.Assignments.Assignment?.forEach((assignment) =>
						seenAssignmentIDs.add(assignment._GradebookID)
					)
				)
		);
		saveSeenAssignmentsToLocalStorage(seenAssignmentIDs);
	}
};

export const showGradebook = async (overrideIndex?: number, forceRefresh = false) => {
	const { studentAccount } = acc;
	if (!studentAccount) return;

	if (gradebooksState.records === undefined || gradebooksState.activeIndex === undefined)
		throw new Error('Gradebooks state is not initialized');

	// If the override index is the same as the active index, override isn't needed
	if (overrideIndex === gradebooksState.activeIndex) gradebooksState.overrideIndex = undefined;
	else gradebooksState.overrideIndex = overrideIndex;

	const index = overrideIndex ?? gradebooksState.activeIndex;

	// Set the state of the requested gradebook to loading in preparation for possible cache refresh
	gradebooksState.records[index] ??= { loaded: false };

	if (gradebooksState.records[index].loaded) gradebooksState.records[index].loaded = false;

	// Check if cache is expired
	let refresh = true;
	if (
		!forceRefresh &&
		Date.now() - (gradebooksState.records[index].lastRefresh ?? 0) < cacheExpirationTime
	) {
		gradebooksState.records[index].loaded = true;
		refresh = false;
	}

	// If expired or refreshing manually, refresh
	if (refresh) {
		try {
			const newGradebook = await studentAccount.gradebook(overrideIndex);

			gradebooksState.records[index].data = newGradebook;
			gradebooksState.records[index].lastRefresh = Date.now();

			// If it retrieved the active gradebook
			if (overrideIndex === undefined) {
				// Check if the active index has changed since the last time it was set
				const newIndex = getPeriodIndex(
					newGradebook.ReportingPeriod,
					newGradebook.ReportingPeriods.ReportPeriod
				);

				// If it has, update the active index
				if (newIndex !== index) gradebooksState.activeIndex = newIndex;
			}
		} catch (err) {
			console.error(err);
		}
	}

	gradebooksState.records[index].loaded = true;

	saveGradebooksState();
};
