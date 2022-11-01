import { int, wu, WuIterable } from "./deps.ts";

export const Utils = <T>(
	getSet: (a0: T) => Array<int>,
	getUnknownCount: (a0: T) => number,
) => ({
	createFreqMap: (iter: WuIterable<T>): Record<int, number> => {
		const map: Record<int, number> = {};
		iter.forEach((set) => {
			getSet(set).forEach((u) => {
				const count = map[u] || 0;
				map[u] = count + 1;
			});
		});
		return map;
	},

	sortByFreq: (items: Array<T>, map: Record<int, number>): void => {
		items.sort((a, b) => {
			const aCount = getSet(a).reduce((acc, u) =>
				acc + (map[u] === undefined ? 0 : map[u]), 0) /
				getUnknownCount(a);
			const bCount = getSet(b).reduce((acc, u) =>
				acc + (map[u] === undefined ? 0 : map[u]), 0) /
				getUnknownCount(b);
			return aCount - bCount;
		});
	},

	lowestValue: (iter: Array<T>): Array<number> => {
		const length_dedup = new Set(
			iter
				.map(getUnknownCount)
				.filter((a) => a !== undefined && a > 0),
		);
		const lengths = Array.from(length_dedup);
		lengths.sort((a, b) => a - b);
		return lengths;
	},

	sortN1s: (n1s: Array<T>, n2s: Array<T>) => {
		const map = Utils(getSet, getUnknownCount).createFreqMap(wu(n2s)); // probably not
		return Utils(getSet, getUnknownCount).sortByFreq(n1s, map);
	},

	extractConcepts: (max: number, n1s: Array<T>) => {
		const set: Set<int> = new Set();
		const itemsIter = n1s
			.map((a0: T) => getSet(a0))
			.flat()
			.reverse();
		for (const item of itemsIter) {
			if (set.size < max) {
				set.add(item);
			} else {
				break;
			}
		}
		return Array.from(set);
	},

	suggestCtxs: (ctxs: Array<T>, newWords: Set<int>): Array<T> => {
		return ctxs.filter((a0: T) => {
			if (getUnknownCount(a0) !== 1) {
				return false;
			}
			if (
				Array.from(getSet(a0)).filter((a0: int) => newWords.has(a0))
					.length !== 1
			) {
				return false;
			}
			return true;
		});
	},
});
