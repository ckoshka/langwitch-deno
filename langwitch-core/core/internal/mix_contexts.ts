import { Rem } from "../../../plugins/deps.ts";
import { BaseContext } from "../deps.ts";

export default (turnoverRate = 0.5) =>
	(oldCtxs: BaseContext[]) =>
		(newCtxs: BaseContext[]) => {
			const retainCount = Math.round(
				Math.min(
					oldCtxs.length * turnoverRate,
					newCtxs.length * turnoverRate,
				),
			);
			return Rem.uniqBy(
				newCtxs.concat(
					oldCtxs.slice(retainCount),
				).filter((c) => c !== undefined),
				(ctx) => ctx.id,
			);
		};
