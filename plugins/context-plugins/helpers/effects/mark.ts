import { BaseContext, ConceptName, Score } from "../../deps.ts";

export type MarkContextEffect = {
	markAnswer: (
		ctx: BaseContext,
	) => (userAnswer: string) => [ConceptName, Score<0, 1>][];
};
