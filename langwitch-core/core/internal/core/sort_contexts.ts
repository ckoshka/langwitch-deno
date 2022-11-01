import { BaseContext, Concept, Free, int, State } from "../../deps.ts";
import { adjust } from "./memory.ts";

export const futurity = (concept: Concept) =>
	adjust(
		concept,
	)(1.0)
		.map((ifCorrect) =>
			Math.abs(
				concept.decayCurve -
					ifCorrect.decayCurve,
			)
		);

// first, add a cache table
// then change chain/reduce to free.flatten
export const sortContexts1 = (state: State) =>
	(ctxs: BaseContext[]) => {
		const cache: Map<string, number> = new Map();
		const positions: Map<int, number> = new Map();
		ctxs.map((c, i) => positions.set(c.id, i));
		return Free.flatten(
			ctxs.map((ctx) =>
				Free.flatten(
					ctx.concepts.filter((c) => state.db.concepts[c]).map(
						(c) => {
							return cache.get(c) !== undefined
								? Free.lift(cache.get(c)) as never
								: futurity(state.db.concepts[c]).map(
									(n) => (cache.set(c, n), n),
								);
						},
					),
				).map((ns) =>
					ns.reduce((prev, curr) => prev + curr, 0) /
					Math.pow(ctx.concepts.length, 0.2)
				)
					.map((result) =>
						[
							ctx,
							result, //* positions.get(ctx.id)!,
						] as [BaseContext, number]
					)
			),
		)
			.map((scoredCtxs) => {
				let allScored = scoredCtxs.sort((a, b) => b[1] - a[1]);
				if (Math.random() > 0.5) {
					allScored = allScored.slice(0, allScored.length / 3).sort((
						_a,
						_b,
					) => Math.random() > 0.5 ? 1 : -1).concat(
						allScored.slice(allScored.length / 3),
					);
				}
				if (allScored[0][0] === ctxs[0]) {
					allScored.push(allScored.shift()!);
				}
				// really, you'd want to randomly sort just the upper half
				return allScored;
			});
	};
// if it's based on the position, it will alternate rapidly between them
// so we need some extra randomness

export const sortContexts = (state: State) =>
	(ctxs: BaseContext[]) => {
		const positions: Map<int, number> = new Map();
		ctxs.map((c, i) => positions.set(c.id, i));
		const scoredCtxs = ctxs.map(ctx => [ctx, ctx.concepts.map(c => state.db.concepts[c].decayCurve).reduce((a, b) => a + b, 0.0)] as const);
		let allScored = scoredCtxs.sort((a, b) => a[1] - b[1]);
		if (Math.random() > 0.5) {
			allScored = allScored.slice(0, allScored.length / 3).sort((
				_a,
				_b,
			) => Math.random() > 0.5 ? 1 : -1).concat(
				allScored.slice(allScored.length / 3),
			);
		}
		if (allScored[0][0] === ctxs[0]) {
			allScored.push(allScored.shift()!);
		}
		// really, you'd want to randomly sort just the upper half
		return allScored;
	};