import { BaseContext, ConceptName, Score, Similar } from "../../deps.ts";
import {
	GetMetadataEffect,
	MarkContextEffect,
} from "../../helpers/effects/mod.ts";
import { PartialStringSimilarityEffect } from "../../helpers/effects/similarity.ts";
import { ScriptMetadata } from "./script.ts";

export const implMarker = (
	f: PartialStringSimilarityEffect<0, 1> & GetMetadataEffect<ScriptMetadata>, // usually Sim.partialSimilarity)
): MarkContextEffect => ({
	markAnswer: (r: BaseContext) => (answer: string) =>
		f.getMetadata(r.id).graphemes.map((g) =>
			[
				g,
				f.partialSimilarity(f.getMetadata(r.id).transliteratedWord)(
					answer,
				),
			] as [ConceptName, Score<0, 1>]
		),
});

export const implPartialStringSimilarity = () =>
	<PartialStringSimilarityEffect<0, 1>> {
		partialSimilarity: (w1) => (w2) => Similar.fullSimilarity(w1)(w2),
	};
