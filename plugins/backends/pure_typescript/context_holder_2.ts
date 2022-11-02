import { BaseContext, int } from "./deps.ts";
import { Hasher } from "./hashing.ts";
import { createWorker, CtxWorker } from "./worker.ts";

export const ContextHolder = (ctxs: BaseContext[]) => {
	const hasher = Hasher(true);
	const worker = createWorker();

	worker.add(
		ctxs.map((c) => ({
			id: c.id,
			unknowns: new Set(c.concepts.map(hasher.hash)),
		})),
	);

	return {
		getNextConcepts: (
			knownsIterable: Iterable<string>,
			n: number,
		): Set<string> => {
			const knowsAsInts = new Set(
				Array.from(knownsIterable).map(hasher.hash),
			);

			const topN1s = worker.getNext(knowsAsInts, n * 2).filter((x) =>
				!knowsAsInts.has(x)
			);
			//.then((xs) => xs.map(hasher.unhash))
			//.then((xs) => xs.sort((a, b) => a.length - b.length))
			//.then((xs) => xs.map(hasher.hash));

			// this has to be here because some words are duplicated

			const set: Set<string> = new Set();

			for (const item of topN1s) {
				if (set.size < n && !knowsAsInts.has(item)) {
					set.add(hasher.unhash(item));
				} else {
					break;
				}
			}
			return set;
		},

		getNextContexts: async (
			knowns: Iterable<string>,
			focus: Iterable<string>,
			maxLen = 1,
		): Promise<Array<int>> => {
			const ids = worker.hasFocusConcepts(
				new Set(Array.from(knowns).map(hasher.hash)),
				Array.from(focus).map(hasher.hash),
				maxLen,
			);
			//const all = new Set([...knowns, ...focus]);
			return ids
				//.filter(i => Array.from(i.all).map(hasher.unhash).filter(x => !all.has(x)).length === 0)
				.map((i) => i.id);
		},

		onlyKnown: (knowns: Iterable<string>) => {
			return worker.allKnown(
				new Set(Array.from(knowns).map(hasher.hash)),
			);
		},

		shutdown: () => {
			worker.emptySelf();
		},
	};
};
