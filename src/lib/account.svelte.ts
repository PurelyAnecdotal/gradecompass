import { LocalStorageKey } from '$lib';
import { StudentAccount } from '$lib/synergy';

export const acc: { studentAccount?: StudentAccount } = $state({});

export const loadStudentAccount = () => {
	const token = localStorage.getItem(LocalStorageKey.token);
	if (token === null) return;

	let parsed: { username: string; password: string; domain: string };
	try {
		parsed = JSON.parse(token);
	} catch {
		localStorage.removeItem(LocalStorageKey.token);
		return;
	}

	const { username, password, domain } = parsed;

	acc.studentAccount = new StudentAccount(domain, username, password);
};
