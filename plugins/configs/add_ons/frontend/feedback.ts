import {
	Br,
	Cls,
	Component,
	Line,
	Message,
	revisable,
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
import {
	MapHintEffect,
	MapShownAnswerEffect,
	MapUserAnswerEffect,
} from "./transforms.ts";

// params: "translation", show front back + answer? displaying scores

export type RenderFeedbackEffect<T> = {
	renderFeedback: (
		metadata: T,
	) => (data: ToProcess) => Component | Promise<Component>;
};

export const showScores = (results: [string, number][]) =>
	results.map((
		[concept, score],
	) => [
		"tertiary",
		`${concept} ➤ ${Math.round(score * 100)}`,
	] as Line);

export const implRenderFeedback = (
	fx: MapShownAnswerEffect & MapUserAnswerEffect & MapHintEffect,
): RenderFeedbackEffect<LanguageMetadata> => ({
	renderFeedback: (metadata) =>
		async (data) =>
			Promise.all([
				fx.mapShownAnswer(metadata.back),
				fx.mapUserAnswer(
					data.userAnswer.length > 0 ? data.userAnswer : " ",
				),
			]).then(async ([shownAnswer, userAnswer]) => [
				//Cls,
				Br,
				["primary", "(❀ˆᴗˆ) my translation is:"],
				["secondary italic", `${metadata.front}`],
				["secondary bold", `${shownAnswer}`],
				Br,
				["primary", "(❀ˆᴗˆ) yours was:"],
				[
					"secondary bold",
					userAnswer,
				],
				Br,
				...showScores(
					await Promise.all(
						data.results.map(async ([concept, score]) =>
							[await fx.mapShownAnswer(concept), score] as [
								string,
								number,
							]
						),
					),
				),
				Br,
			]),
});

export default <T>(validatorFn: (a0: unknown) => a0 is T) =>
	use<
		& PrinterEffect
		& UserInputEffect<Promise<string>>
		& RenderFeedbackEffect<T>
	>()
		.map2(
			(fx) =>
				async (
					m: Message<ToProcess, State>,
				): Promise<LangwitchMessage> => {
					const metadata = m.state.queue[0].metadata;
					if (validatorFn(metadata)) {
						// Could calculate the next state in the background while the user is still reading stuff
						// but that breaks compositionality
						// being forced to merge two different states together just because they need to be executed asynchronously is bad.
						// unless we did the user input stuff inside the next state fn?
						await Promise.resolve(
							fx.renderFeedback(metadata)(m.data),
						).then(fx.print);
						return revisable(m).revise({ next: "process" })
							.contents;
					}
					return m;
				},
		);
// this could be generalised to
// - take a fn that
//	Metadata -> Component
// - and a fn that
// 	unknown: is Metadata -> bool
