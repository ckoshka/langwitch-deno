import { State } from "../mod.ts";
import { Concept } from "../types/concept.ts";
import { BaseContext } from "../types/context.ts";

type ContextScore = number;
export type SortContextsEffect = {
	sortContexts: (state: State) => (ctxs: BaseContext[]) => [BaseContext, ContextScore][];
};