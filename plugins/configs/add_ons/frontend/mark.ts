import { Message, romanize, Similar, State, use } from "../../../deps.ts";
import {
	LanguageMetadata,
	LangwitchMessage,
	ToMark,
} from "../../../state-transformers/mod.ts";
import { isLanguageMetadata } from "../../shared/mod.ts";

// params: measure similarity, normalise text

type ConceptId = string;
type Score<Min, Max> = number;

export type MarkUserAnswerEffect<T> = {
	markAnswer: (
		metadata: T,
	) => (userAnswer: string) => [ConceptId, Score<0, 1>][];
};

export const measureSimilarity = (w1: string) =>
	(w2: string) =>
		Similar.partialSimilarity({ word: w1, tokenise: false })(w2);

export const normalise = (s: string) => romanize(s.toLowerCase());
export const implMarkUserAnswer: MarkUserAnswerEffect<LanguageMetadata> = {
	markAnswer: (metadata) =>
		(answer) =>
			metadata.words.map((w) =>
				[
					w,
					measureSimilarity(normalise(w))(
						normalise(answer),
					),
				] as [string, number]
			),
};

export default <T>(validatorFn: (a0: unknown) => a0 is T) =>
	use<MarkUserAnswerEffect<T>>().map2(fx => (
		m: Message<ToMark, State>,
	): LangwitchMessage => {

		const metadata = m.state.queue[0].metadata;

		if (validatorFn(metadata)) {
			const results = fx.markAnswer(metadata)(m.data.userAnswer);
			return {
				data: {
					results,
					userAnswer: m.data.userAnswer,
				},
				state: m.state,
				next: "feedback",
			};
		}
		return m;
	});
