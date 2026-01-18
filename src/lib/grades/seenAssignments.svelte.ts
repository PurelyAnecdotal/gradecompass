import { browser } from '$app/environment';
import { LocalStorageKey } from '$lib';
import { SvelteSet } from 'svelte/reactivity';
import { getSeenAssignmentsFromLocalStorage } from './seenAssignments';

export const seenAssignmentIDs = new SvelteSet<string>();

if (browser) {
	try {
		const lsCache = getSeenAssignmentsFromLocalStorage();
		if (lsCache) lsCache.forEach((id) => seenAssignmentIDs.add(id));
	} catch (e) {
		console.error(e);
		localStorage.removeItem(LocalStorageKey.seenAssignmentIDs);
	}
}
