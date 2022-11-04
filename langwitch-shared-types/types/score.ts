import { ConceptName } from "./concept.ts";

export type Score<Min extends number, Max extends number> =
	& number
	& { ___score: never }
	& Record<Min, never>
	& Record<Max, never>;

export type MarkedResult = [ConceptName, Score<0, 1>][];
