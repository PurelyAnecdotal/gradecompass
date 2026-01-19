import { LocalStorageKey } from '$lib';

export function getSeenAssignmentsFromLocalStorage() {
	const seenIDsStr = localStorage.getItem(LocalStorageKey.seenAssignmentIDs);
	if (seenIDsStr === null) return;

	const seenIDs: string[] = JSON.parse(seenIDsStr);

	const seenAssignmentIDs = new Set<string>();
	seenIDs.forEach((id) => seenAssignmentIDs.add(id));

	return seenAssignmentIDs;
}

export const saveSeenAssignmentsToLocalStorage = (seenAssignmentIDs: Set<string>) =>
	localStorage.setItem(LocalStorageKey.seenAssignmentIDs, JSON.stringify([...seenAssignmentIDs]));
