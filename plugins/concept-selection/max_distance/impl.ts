import { Similar } from "../deps.ts";
import { mostToLeastUnique } from "./maxdissim.ts";

export const maximiseDissimilarity = (learning: string[]) =>
	mostToLeastUnique<string>({
		distanceFn: (c1) => (c2) => Similar.fullSimilarity(c1)(c2),
	})(learning);

// lengthToConfusabilityRatio: number; // defaults to around 0.68
