import { Concept } from "../types/concept.ts";
import { BaseContext } from "../types/context.ts";

export type IsKnownEffect = {
	isKnown: (c: Concept) => boolean;
};

export type SortContextsEffect = {
	sortContexts: (ctxs: BaseContext[]) => BaseContext[];
};