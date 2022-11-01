import { Concept } from "../deps.ts";

export type GetConceptsEffect = {
	getConcepts: () => Record<string, Concept>;
};

export type StoreConceptsEffect = {
	storeConcepts: (concepts: Record<string, Concept>) => void;
};
