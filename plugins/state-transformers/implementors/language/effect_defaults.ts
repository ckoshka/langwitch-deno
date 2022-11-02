import { PreMarkingProcessingEffect } from "../../helpers/effects/preprocess.ts";
import { PartialStringSimilarityEffect } from "../../helpers/effects/similarity.ts";
import { romanize, Similar } from "../deps.ts";

export const implPreprocess = () =>
	<PreMarkingProcessingEffect> {
		preprocess: (s) => romanize(s.toLowerCase()),
	};

export const implPartialStringSimilarity = () =>
	<PartialStringSimilarityEffect<0, 1>> {
		partialSimilarity: (w1) => (w2) =>
			Similar.partialSimilarity({ word: w1, tokenise: false })(w2),
	};
