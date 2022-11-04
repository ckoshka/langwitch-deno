import { Concept } from "../mod.ts";

export type ConceptFilterEffect = {
	filterConcepts: (concepts: string[], topK: number) => string[];
};
