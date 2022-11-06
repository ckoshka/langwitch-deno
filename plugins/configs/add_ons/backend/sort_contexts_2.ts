import {
	adjust,
	BaseContext,
	Concept,
	Free,
	int,
	State,
} from "../../../deps.ts";
import { randomise } from "./sort_contexts.ts";

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
export default (state: State) =>
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
        .map(newCtxs => randomise(ctxs, newCtxs))
	};
