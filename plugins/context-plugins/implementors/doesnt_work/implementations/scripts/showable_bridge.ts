import { FeedbackEffect, StyledPrinterEffect } from "../../deps.ts";
import { GetMetadataEffect } from "../../helpers/effects/mod.ts";
import { ScriptMetadata } from "./script.ts";
import { ShowResults } from "./showable.ts";

export const implPrompt = (
	fx: StyledPrinterEffect & GetMetadataEffect<ScriptMetadata>,
) => (<FeedbackEffect> {
	feedback: (state) => (result) =>
		fx.render(ShowResults({
			referenceAnswer:
				fx.getMetadata(state.queue[0].id).transliteratedWord,
			conceptScores: result,
		})),
});

/*

prompt: (state) =>
		R.pipe(ShowPrompt, fx.render)({
			translation: state.queue[0].metadata.originalWord,
		}),
*/
