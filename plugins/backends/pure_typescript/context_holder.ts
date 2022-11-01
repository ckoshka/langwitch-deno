import { BaseContext, chunk, int, Pool, PromisedModule } from "./deps.ts";
import { Hasher } from "./hashing.ts";
import { worker } from "./worker.ts";

// what does a worker thread do effectively?
// it turns a synchronous function into an asynchronous one by executing it in a different process
// the details of chunk size should be left to the implementation.

export type CtxWorkerThread = PromisedModule<typeof worker>;
export class ContextHolder {
	constructor(
		private workers: Array<typeof worker> = [],
		private hasher: Hasher,
	) {}
	static async spawn(ctxs: BaseContext[]) {
		//console.log("Got here")
		const hasher = Hasher(true);
		worker.add(
			ctxs.map((c) => ({
				id: c.id,
				unknowns: new Set(c.concepts.map(hasher.hash)),
			})),
		);
		//console.log("Got here");
		//const freqmap = utils.createFreqMap(ctxs);
		return new ContextHolder([worker], hasher);
	}

	gather<T>(fn: (w: typeof worker) => T): Promise<T[]> {
		return Promise.resolve(this.workers.map(fn));
	}

	async getNextConcepts(
		knownsIterable: Iterable<string>,
		n: number,
	): Promise<Set<string>> {
		const knowsAsInts = new Set(
			Array.from(knownsIterable).map(this.hasher.hash),
		);

		const topN1s = await this.gather((w) => w.getNext(knowsAsInts, n * 2))
			.then((a) => a.flat())
			.then((xs) => xs.filter((x) => !knowsAsInts.has(x)));
			//.then((xs) => xs.map(this.hasher.unhash))
			//.then((xs) => xs.sort((a, b) => a.length - b.length))
			//.then((xs) => xs.map(this.hasher.hash));

		// this has to be here because some words are duplicated

		const set: Set<string> = new Set();

		for (const item of topN1s) {
			if (set.size < n && !knowsAsInts.has(item)) {
				set.add(this.hasher.unhash(item));
			} else {
				break;
			}
		}
		return set;
	}
	// can be done in parallel, but not in the same way, extract this to a different method. sub and all

	async getNextContexts(
		knowns: Iterable<string>,
		focus: Iterable<string>,
		maxLen = 1,
	): Promise<Array<int>> {
		const ids = await this.gather((w) =>
			w.hasFocusConcepts(
				new Set(Array.from(knowns).map(this.hasher.hash)),
				Array.from(focus).map(this.hasher.hash),
				maxLen,
			)
		);
		const all = new Set([...knowns, ...focus]);
		return ids.flat()
			//.filter(i => Array.from(i.all).map(this.hasher.unhash).filter(x => !all.has(x)).length === 0)
			.map((i) => i.id);
	}

	async onlyKnown(knowns: Iterable<string>) {
		return await this.gather((w) =>
			w.allKnown(new Set(Array.from(knowns).map(this.hasher.hash)))
		).then((c) => c.flat());
	}

	async shutdown() {
		await this.gather((w) => w.emptySelf());
	}
}
