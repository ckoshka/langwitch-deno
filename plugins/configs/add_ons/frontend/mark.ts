import { Message, romanize, Similar, State } from "../../../deps.ts";
import { LangwitchMessage, ToMark } from "../../../state-transformers/mod.ts";
import { isLanguageMetadata } from "../../shared/mod.ts";

export default (
	m: Message<ToMark, State>,
): LangwitchMessage => {
	const measureSimilarity = (w1: string) => (w2: string) =>
		Similar.partialSimilarity({ word: w1, tokenise: false })(w2);

	const normalise = (s: string) => romanize(s.toLowerCase());
	// should also strip punctuation? but what if it's semantically significant?

	const metadata = m.state.queue[0].metadata;

	if (isLanguageMetadata(metadata)) {
		const results = metadata.words.map((w) =>
			[
				w,
				measureSimilarity(normalise(w))(
					normalise(m.data.userAnswer),
				),
			] as [string, number]
		);
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
};
