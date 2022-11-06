import { BaseContext, int, Revisable, revisable } from "./deps.ts";
import { ContextHolder } from "./context_holder.ts";
import { ConceptQueryEffect, ContextQueryEffect, Free } from "./deps.ts";
import { LanguageMetadata } from "../../state-transformers/mod.ts";

export const initJsQuerier = async (ctxs: (BaseContext)[]): Promise<
	ContextQueryEffect & ConceptQueryEffect
> => {
	const holder = await ContextHolder(ctxs);
	const reverseMap = new Map(ctxs.map((c) => [c.id, c]));
	return {
		nextConcepts: ({ knowns, total }) =>
			holder.getNextConcepts(knowns, total),
		nextContexts: ({ knowns, focus }) =>
			holder.getNextContexts(knowns, focus)
				.then((ids) => ids.map((i) => reverseMap.get(i)!)),
	};
};

// a wrapper for multiple backends?

export const mergeMultipleBackends = (
	backends: (ContextQueryEffect & ConceptQueryEffect)[],
): ContextQueryEffect & ConceptQueryEffect => {
	return {
		nextConcepts: ({ knowns, total }) =>
			Promise.all(
				backends.map((backend) =>
					backend.nextConcepts({ knowns, total })
				),
			).then((axs) => {
				const s = new Set<string>();
				axs.forEach((ax) => ax.forEach((a) => s.add(a)));
				return s;
			}),
		nextContexts: ({ knowns, focus }) =>
			Promise.all(
				backends.map((backend) =>
					backend.nextContexts({ knowns, focus })
				),
			).then((a) => a.flat()),
	};
};
