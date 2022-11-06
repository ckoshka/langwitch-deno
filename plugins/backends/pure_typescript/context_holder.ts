import { BaseContext, Comlink, int } from "./deps.ts";
import { Hasher } from "./hashing.ts";
import { CtxWorker } from "./worker.ts";

export const ContextHolder = async (ctxs: BaseContext[]) => {
	const hasher = Hasher(true);
	const w1 = new Worker(new URL("./worker.ts", import.meta.url), {
		type: "module",
	});
	const worker = Comlink.wrap<CtxWorker>(w1);

	await worker.add(
		ctxs.map((c) => ({
			id: c.id,
			unknowns: new Set(c.concepts.map(hasher.hash)),
		})),
	);

	return {
		getNextConcepts: async (
			knownsIterable: Iterable<string>,
			n: number,
		): Promise<Set<string>> => {
			const knowsAsInts = new Set(
				Array.from(knownsIterable).map(hasher.hash),
			);

			const topN1s = await worker.getNext(knowsAsInts, n * 4).then((xs) =>
				xs.filter((x) => !knowsAsInts.has(x))
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
			const ids = await worker.hasFocusConcepts(
				new Set(Array.from(knowns).map(hasher.hash)),
				Array.from(focus).map(hasher.hash),
				maxLen,
			);
			//const all = new Set([...knowns, ...focus]);
			return ids
				//.filter(i => Array.from(i.all).map(hasher.unhash).filter(x => !all.has(x)).length === 0)
				.map((i) => i.id);
		},

		onlyKnown: async (knowns: Iterable<string>) => {
			return await worker.allKnown(
				new Set(Array.from(knowns).map(hasher.hash)),
			);
		},

		shutdown: async () => {
			await worker.emptySelf();
		},
	};
};
