import {
	Br,
	Cls,
	Component,
	Input,
	Line,
	Message,
	Rem,
	State,
	use,
	UserInputEffect,
} from "../../../deps.ts";
import { PrinterEffect } from "../../../state-transformers/helpers/effects/print.ts";
import {
	LanguageMetadata,
	LangwitchMessage,
	ToProcess,
} from "../../../state-transformers/mod.ts";
import { isLanguageMetadata } from "../../shared/mod.ts";
import fx from "./io.ts";

// params: "translation", show front back + answer? displaying scores

export type RenderFeedbackEffect<T> = {
	renderFeedback: (metadata: T) => (data: ToProcess) => Component;
};

export const showScores = (results: [string, number][]) =>
	results.map((
		[concept, score],
	) => [
		"tertiary",
		`${concept} ➤ ${Math.round(score * 100)}`,
	] as Line);

export const implRenderFeedback: RenderFeedbackEffect<LanguageMetadata> = {
	renderFeedback: (metadata) =>
		(data) => [
			Cls,
			Br,
			["primary", "(❀ˆᴗˆ) my translation is:"],
			["secondary underlined", metadata.front],
			["secondary underlined", metadata.back],
			Br,
			["primary", "(❀ˆᴗˆ) yours was:"],
			["secondary bold", data.userAnswer],
			Br,
			...showScores(data.results),
			Br,
		],
};

export default <T>(validatorFn: (a0: unknown) => a0 is T) =>
	use<
		& PrinterEffect
		& UserInputEffect<Promise<string>>
		& RenderFeedbackEffect<T>
	>()
		.map2((fx) =>
			async (m: Message<ToProcess, State>): Promise<LangwitchMessage> => {
				const metadata = m.state.queue[0].metadata;
				if (validatorFn(metadata)) {
					Rem.pipe(
						fx.renderFeedback(metadata)(m.data),
						fx.print,
					);
					await fx.ask("press enter to continue");
					return {
						data: m.data,
						next: "process",
						state: m.state,
					};
				}
				return m;
			}
		);
// this could be generalised to
// - take a fn that
//	Metadata -> Component
// - and a fn that
// 	unknown: is Metadata -> bool
