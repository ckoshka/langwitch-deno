import { BaseContext, int, State } from "../../../deps.ts";

export const randomise = (
	newCtxs: BaseContext[],
	oldCtxs: [BaseContext, number][],
) => {
	let allScored = oldCtxs.slice();
	if (Math.random() > 0.5) {
		allScored = allScored.slice(0, allScored.length / 3).sort((
			_a,
			_b,
		) => Math.random() > 0.5 ? 1 : -1).concat(
			allScored.slice(allScored.length / 3),
		);
	}
	if (allScored[0] && allScored[0][0] === newCtxs[0]) {
		allScored.push(allScored.shift()!);
	}
	return allScored;
};
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
	return randomise(ctxs, allScored);
};
