import type { Badge } from '$lib/components/ui/badge';
import { Buffer } from 'buffer';
import { fileTypeFromBuffer } from 'file-type';
import type { ComponentProps } from 'svelte';
import { acc } from './account.svelte';

// ex: "Class Name (P)" -> "Class Name"
export const removeCourseType = (name: string) => name.replace(/ \([A-Z]+\)$/, '');

const rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });

export function getRelativeTime(date: Date) {
	const now = new Date();
	const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	const months = Math.floor(days / 30);
	const years = Math.floor(days / 365);

	if (seconds < 60) {
		return rtf.format(-seconds, 'second');
	} else if (minutes < 60) {
		return rtf.format(-minutes, 'minute');
	} else if (hours < 24) {
		return rtf.format(-hours, 'hour');
	} else if (days < 30) {
		return rtf.format(-days, 'day');
	} else if (months < 12) {
		return rtf.format(-months, 'month');
	} else {
		return rtf.format(-years, 'year');
	}
}

export const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
	dateStyle: 'short'
});

export const fullDateFormatter = new Intl.DateTimeFormat('en-US', {
	dateStyle: 'full'
});

export async function getBlobURLFromBase64String(base64: string) {
	const byteArray = new Uint8Array(Buffer.from(base64, 'base64'));

	const mimeType = (await fileTypeFromBuffer(byteArray))?.mime;

	if (mimeType === undefined) throw new Error('Could not determine MIME type');

	const blob = new Blob([byteArray], { type: mimeType });

	return URL.createObjectURL(blob);
}

export enum LocalStorageKey {
	token = 'token',
	gradebook = 'gradebook4',
	seenAssignmentIDs = 'seenAssignmentIDs',
	attendance = 'attendance',
	documents = 'documents',
	mailData = 'mailData',
	studentInfo = 'studentInfo'
}

export interface RecordState<T> {
	data?: T;
	loaded: boolean;
	lastRefresh?: number;
}

export interface LocalStorageCache<T> {
	data: T;
	lastRefresh: number;
}

export const loadRecord = async <T>(
	recordState: RecordState<T>,
	loadFunc: () => Promise<T>,
	localStorageKey: string,
	cacheExpirationTime: number | undefined,
	forceRefresh = false
) => {
	if ((recordState.data !== undefined && !forceRefresh) || acc.studentAccount === undefined) return;

	recordState.loaded = false;

	let refresh = true;

	const cacheStr = localStorage.getItem(localStorageKey);
	if (cacheStr !== null) {
		try {
			const cache: LocalStorageCache<T> = JSON.parse(cacheStr);

			recordState.data = cache.data;
			recordState.lastRefresh = cache.lastRefresh;

			if (cacheExpirationTime !== undefined && Date.now() - cache.lastRefresh < cacheExpirationTime)
				refresh = false;
		} catch (error) {
			console.error(error);
			localStorage.removeItem(localStorageKey);
		}
	}

	if (refresh || forceRefresh) {
		try {
			recordState.data = await loadFunc();
			recordState.lastRefresh = Date.now();

			const newCache: LocalStorageCache<T> = {
				data: recordState.data,
				lastRefresh: recordState.lastRefresh
			};

			localStorage.setItem(localStorageKey, JSON.stringify(newCache));
		} catch (error) {
			console.error(error);
		}
	}

	recordState.loaded = true;
};

// https://github.com/barvian/number-flow/blob/e9fc6999417df7cb7e7b290f7f2019f570c18cc7/packages/number-flow/src/index.ts#L73
export const numberFlowDefaultEasing =
	'linear(0,.005,.019,.039,.066,.096,.129,.165,.202,.24,.278,.316,.354,.39,.426,.461,.494,.526,.557,.586,.614,.64,.665,.689,.711,.731,.751,.769,.786,.802,.817,.831,.844,.856,.867,.877,.887,.896,.904,.912,.919,.925,.931,.937,.942,.947,.951,.955,.959,.962,.965,.968,.971,.973,.976,.978,.98,.981,.983,.984,.986,.987,.988,.989,.99,.991,.992,.992,.993,.994,.994,.995,.995,.996,.996,.9963,.9967,.9969,.9972,.9975,.9977,.9979,.9981,.9982,.9984,.9985,.9987,.9988,.9989,1)';

export type BadgeColor = NonNullable<ComponentProps<typeof Badge>['color']>;

export const bgColorVariants: Record<BadgeColor, string> = {
	red: 'bg-red-500',
	orange: 'bg-orange-500',
	amber: 'bg-amber-500',
	yellow: 'bg-yellow-500',
	lime: 'bg-lime-500',
	green: 'bg-green-500',
	emerald: 'bg-emerald-500',
	teal: 'bg-teal-500',
	cyan: 'bg-cyan-500',
	sky: 'bg-sky-500',
	blue: 'bg-blue-500',
	indigo: 'bg-indigo-500',
	violet: 'bg-violet-500',
	purple: 'bg-purple-500',
	fuchsia: 'bg-fuchsia-500',
	pink: 'bg-pink-500',
	rose: 'bg-rose-500',
	default: 'bg-gray-500'
};

export const tailwindColors = [
	'red',
	'orange',
	'amber',
	'yellow',
	'lime',
	'green',
	'emerald',
	'teal',
	'cyan',
	'sky',
	'blue',
	'indigo',
	'violet',
	'purple',
	'fuchsia',
	'pink',
	'rose'
] as const;
