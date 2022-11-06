import { Message, State, use } from "../../../deps.ts";
import { LanguageMetadata, PrinterEffect, ToMark } from "../../../state-transformers/mod.ts";
import { isLanguageMetadata } from "../../shared/mod.ts";
import { MarkUserAnswerEffect } from "../frontend/mark.ts";


export default 
	use<PrinterEffect & MarkUserAnswerEffect<LanguageMetadata>>().map2(fx => async (
		m: Message<ToMark, State>,
	) => {
		// Check if it's the right command
		if (m.data?.userAnswer?.startsWith("!has")) {

			// Extract the word
            const word = m.data.userAnswer.replace("!has ", "");
			const metadata = m.state.queue[0].metadata;

			if (isLanguageMetadata(metadata)) {
				
				// Check if the marker would mark the word as correct
				const inSentence = fx.markAnswer(metadata)(word).find((w) => w[0] === word && w[1] === 1.0) !== undefined;

				inSentence ? await fx.print([
					["primary", `Yes! ${word} is in the sentence`]
				]) : await fx.print([
					["secondary", `Nope! ${word} isn't in the sentence`]
				]);

				await new Promise(resolve => setTimeout(resolve, 1500));

				return {
					...m,
					next: "quiz"
				}
			}
        }
		return m;
	});

// or, even easier: accept a stack of interpreters.
// some of these require effects, so Interpret.map(i => ??)
// so i think we need the machine to be handed out kinda
// nontraditional method would work?
// higher-level: get commands