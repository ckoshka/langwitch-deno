import { BaseContext, Revisable, revisable } from "./deps.ts";
import { ContextHolder } from "./context_holder.ts";
import { ConceptQueryEffect, ContextQueryEffect, Free } from "./deps.ts";

export const initJsQuerier = () =>
	Free.reader(async (
		{ ctxs }: {
			ctxs: (BaseContext)[];
		},
	): Promise<
		ContextQueryEffect & ConceptQueryEffect
	> => {
		const holder = await ContextHolder.spawn(ctxs);
		const reverseMap = new Map(ctxs.map((c) => [c.id, c]));
		return {
			nextConcepts: ({ knowns, total }) =>
				holder.getNextConcepts(knowns, total),
			nextContexts: ({ knowns, focus }) =>
				holder.getNextContexts(knowns, focus)
					.then((ids) => ids.map((i) => reverseMap.get(i)!)),
		};
	});
