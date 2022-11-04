import { maximiseEase } from "../../../concept-selection/mod.ts";
import { sortInfallible } from "../../../deps.ts";

export default {
	filterConcepts: (cxs: string[], n: number) => {
		const res = sortInfallible([
			[maximiseEase(cxs), 0.5],
		]).slice(0, n);
		return res;
	},
};
