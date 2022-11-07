import {
	Message,
	revisable,
	romanize,
	Similar,
	State,
	use,
} from "../../../deps.ts";
import {
	LanguageMetadata,
	LangwitchMessage,
	ToMark,
} from "../../../state-transformers/mod.ts";
import { isLanguageMetadata } from "../../shared/mod.ts";
import { MapReferenceAnswerEffect, MapUserAnswerEffect } from "./transforms.ts";

// params: measure similarity, normalise text

type ConceptId = string;
type Score<Min, Max> = number;

export type MarkUserAnswerEffect<T> = {
	markAnswer: (
		metadata: T,
	) => (userAnswer: string) => [ConceptId, Score<0, 1>][] | Promise<[ConceptId, Score<0, 1>][]>;
};

export type MeasurePartialSimilarity = {
	measurePartialSimilarity: (
		expectedWord: string,
	) => (actualAnswer: string) => Score<0, 1>;
};

export const implMeasurePartialSimilarity: MeasurePartialSimilarity = {
	measurePartialSimilarity:
		(expectedWord: string) => (actualAnswer: string) =>
			Similar.partialSimilarity({ word: expectedWord, tokenise: false })(
				actualAnswer,
			),
};

export const normalise = (s: string) => romanize(s.toLowerCase());
export const implMarkUserAnswer = (
	fx:
		& MapReferenceAnswerEffect
		& MapUserAnswerEffect
		& MeasurePartialSimilarity,
): MarkUserAnswerEffect<LanguageMetadata> => ({
	markAnswer: (metadata) => (answer) =>
		Promise.all(metadata.words.map(async (w) =>
			[
				w,
				await Promise.all([fx.mapReferenceAnswer(w), fx.mapUserAnswer(answer)])
					.then(([referenceAnswer, userAnswer]) => 
				fx.measurePartialSimilarity(referenceAnswer)(
					userAnswer,
				)),
			] as [string, number]
		)),
});

// pattern: the implementation cares about the lower-level details, the higher-level chunks are larger.

export default <T>(validatorFn: (a0: unknown) => a0 is T) =>
	use<MarkUserAnswerEffect<T>>().map2((fx) =>
	async (
		m: LangwitchMessage,
	) => {
		const metadata = m.state.queue[0].metadata;

		if (validatorFn(metadata) && m.data?.userAnswer !== undefined) {
			const results = await fx.markAnswer(metadata)(m.data.userAnswer);
			return revisable(m)
				.map("data", (data) => ({ ...data, results }))
				.revise({ next: "feedback" })
				.contents;
		}
		return m;
	});
