import { parseGradebookXML } from '$lib/synergy';
import type { Gradebook } from '$lib/types/Gradebook';
import { gradebookState } from './catalog.svelte';

let parsedGradebook: { index: number; lastRefresh: number; gradebook: Gradebook } | undefined =
	undefined;

export function getActiveGradebook() {
	const { gradebookCatalog } = gradebookState;
	if (!gradebookCatalog) return;

	const index = gradebookCatalog.overrideIndex ?? gradebookCatalog.defaultIndex;
	const record = gradebookCatalog.recordCache[index];
	if (!record) return;

	if (
		parsedGradebook &&
		index === parsedGradebook.index &&
		parsedGradebook.lastRefresh === record.lastRefresh
	)
		return parsedGradebook.gradebook;

	parsedGradebook = {
		index,
		lastRefresh: record.lastRefresh,
		gradebook: parseGradebookXML(record.xml)
	};
	return parsedGradebook.gradebook;
}
