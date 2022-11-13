import { BaseContext, CoreParams, int, ParamsReader, RandomEffect, State, use } from "../../../deps.ts";

export const randomise = use<ParamsReader & RandomEffect<0, 1>>().map2(fx => (
	newCtxs: BaseContext[]
) => (oldCtxs: [BaseContext, number][]) => {
	let allScored = oldCtxs.slice();
	if (fx.random() > fx.$params.$contexts.probabilityRandomShuffle) {
		allScored = allScored.slice(0, allScored.length * fx.$params.$contexts.topFractionContextRandomisation).sort((
			_a,
			_b,
		) => fx.random() > 0.5 ? 1 : -1).concat(
			allScored.slice(allScored.length * fx.$params.$contexts.topFractionContextRandomisation),
		);
	}
	if (allScored[0] && allScored[0][0] === newCtxs[0]) {
		allScored.push(allScored.shift()!);
	}
	return allScored;
});

export default (state: State) => (ctxs: BaseContext[]) => {
	const positions: Map<int, number> = new Map();
	ctxs.map((c, i) => positions.set(c.id, i));
	const scoredCtxs = ctxs.map((ctx) =>
		[
			ctx,
			ctx.concepts.map((c) => state.db.concepts[c].decayCurve).reduce(
				(a, b) => (a * 1.02) + b,
				0.0,
			),
		] as [BaseContext, number]
	);
	let allScored = scoredCtxs.sort((a, b) => a[1] - b[1]);
	return randomise.map(fn => fn(ctxs)(allScored));
};
