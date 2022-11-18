import { Rem } from "../../../plugins/deps.ts";
import { BaseContext } from "../deps.ts";

/**
 * Mixes old contexts with new contexts, deduplicates them, and discards a fraction of the old contexts.
 */
export const mixContexts = (turnoverRate = 0.5) =>
	(oldCtxs: BaseContext[]) =>
		(newCtxs: BaseContext[]) => {
			const retainCount = Math.round(
				Math.min(
					oldCtxs.length * turnoverRate,
					newCtxs.length * turnoverRate,
				),
			);
			return Rem.uniqBy(
				oldCtxs.slice().reverse().slice(retainCount).concat(newCtxs).filter((c) =>
					c !== undefined
				),
				(ctx) => ctx.id,
			);
		};
