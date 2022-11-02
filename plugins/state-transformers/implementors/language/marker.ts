import { LanguageMetadata } from "../../context-types/mod.ts";
import { ConceptName, Message, Phase, Score, State, use } from "../../deps.ts";
import { GetMetadataEffect } from "../../helpers/effects/metadata.ts";
import { PreMarkingProcessingEffect } from "../../helpers/effects/preprocess.ts";
import { PartialStringSimilarityEffect } from "../../helpers/effects/similarity.ts";
import { ToMark, ToProcess } from "../message_types.ts";

export default Phase({
	phase: `mark`,
	fn: ({ state, data: m }: Message<ToMark, State>) =>
		use<
			& PreMarkingProcessingEffect
			& PartialStringSimilarityEffect<0, 1>
			& GetMetadataEffect<LanguageMetadata>
		>().map2(async (f): Promise<Message<ToProcess, State>> => {
			if (m.answer === "") {
				m.answer = f.getMetadata(state.queue[0].id).back;
			}
			const results = f.getMetadata(state.queue[0].id).words.map((
				w,
			) => [
				w,
				f.partialSimilarity(f.preprocess(w))(
					f.preprocess(m.answer),
				),
			] as [ConceptName, Score<0, 1>]);
			return {
				data: {
					results,
				},
				state,
				next: "feedback",
			};
		}),
});
