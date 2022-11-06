import { Comlink, expose, int, wu, WuIterable } from "./deps.ts";
import { Utils as U } from "./utils.ts";
import { newContext, WorkerContext } from "./worker_context.ts";

export const utils = U(
	(a: WorkerContext) => Array.from(a.unknowns),
	(a: WorkerContext) => a.unknowns.size,
);

export class AllContextsExhausted extends Error {}

let CONTEXTS: WorkerContext[] = [];

const worker = {
	add(ctxs: { id: int; unknowns: Set<int> }[]) {
		CONTEXTS = CONTEXTS.concat(ctxs.map((c) => newContext(c)));
		//console.log(CONTEXTS);
	},

	of(
		ctxs: WuIterable<WorkerContext>,
		num: number,
		max = 400000,
	): WuIterable<WorkerContext> {
		return ctxs
			.filter((c: WorkerContext) => c.unknowns.size === num)
			.slice(0, max);
	},

	getNext(knowns: Set<int>, n: number, lowestValue = 1): int[] {
		if (lowestValue !== 1) {
			const mins = utils.lowestValue(CONTEXTS);
			lowestValue = mins[0];
		}
		const [ctxs1, ctxs2] = wu(worker.subtracted(knowns)).tee();
		const n1s = worker.of(ctxs1, lowestValue);
		const map = utils.createFreqMap(worker.of(ctxs2, lowestValue + 1));
		const freq = (u: int) => (map[u] !== undefined ? map[u] : 0);
		const withLabels: int[] = n1s.map((c) => [...c.unknowns]).flatten()
			.toArray();
		const result = withLabels
			.sort((a, b) => freq(b) - freq(a))
			.slice(0, n);

		if (result.length === 0) {
			throw new AllContextsExhausted();
		}
		return result;
	},

	*subtracted(_knowns: Set<int>) {
		//console.log(_knowns);
		// turn this into a producer function then pass it to the other ones?
		for (let i = 0; i < CONTEXTS.length; i++) {
			const a0 = CONTEXTS[i];
			//console.log(a0);
			yield {
				...a0,
				unknowns: new Set(
					Array.from(a0.unknowns).filter((u) => !_knowns.has(u)),
				),
			};
		}
	},

	hasFocusConcepts(knowns: Set<int>, _focus: Iterable<int>, maxLen = 1) {
		const focus = new Set(_focus);
		const ctxs = worker.subtracted(knowns);
		const n1s = worker.of(wu(ctxs), 1);
		return Array.from(
			n1s.filter(
				(c) =>
					Array.from(c.unknowns).filter((w) => focus.has(w))
						.length === maxLen,
			),
		);
	},

	allKnown(knowns: Set<int>) {
		const ctxs = worker.subtracted(knowns);
		return Array.from(worker.of(wu(ctxs), 0).map((c) => c.id));
	},

	emptySelf() {
		CONTEXTS = [];
	},
};

Comlink.expose(worker);

export type CtxWorker = typeof worker;
