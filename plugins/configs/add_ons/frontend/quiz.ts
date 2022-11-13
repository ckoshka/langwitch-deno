import {
	Br,
	Cls,
	colors,
	Component,
	Concept,
	ConceptName,
	EffectsOf,
	HiderEffect,
	Input,
	Line,
	revisable,
	State,
	Table,
	use,
	UserInputEffect,
} from "../../../deps.ts";
import { makeHint } from "../../../hint-plugins/hint_effect.ts";
import { PrinterEffect } from "../../../state-transformers/helpers/effects/print.ts";
import {
	LanguageMetadata,
	LangwitchMessage,
} from "../../../state-transformers/mod.ts";
import {
	fromEnv,
	importDefault,
	isLanguageMetadata,
} from "../../shared/mod.ts";
import { MapHintEffect } from "./transforms.ts";

// params: how to hint, what metadata:
// check if right metadata, what instructions, what cue, what commands

export type CreateHintMap<Meta> = {
	createHintMap: (state: State) => (metadata: Meta) => number[];
};

export type RenderHintEffect<Meta> = {
	renderHint: (
		metadata: Meta,
	) => (numLettersShownForEachWord: number[]) => string | Promise<string>;
};

export const implRenderHint = (
	{ hider, mapHint }: HiderEffect & MapHintEffect,
): RenderHintEffect<LanguageMetadata> => {
	return {
		renderHint: (meta) =>
			(lettersShown) =>
				Promise.resolve(mapHint(meta.words)).then((words) =>
					words.map((word, i) =>
						hider.show(Math.round(lettersShown[i] * word.length))(word)
					)
						.map((hint) => `${hint} (${hint.length})`)
						.join(" ")
				),
	};
};

export type RenderCueEffect<Meta> = {
	renderCue: (metadata: Meta) => Component;
};

export type RenderCommandsEffect = {
	renderCommands: () => Component;
};

export type RenderInstructionEffect<T> = {
	renderInstruction: () => Component;
};

export const implRenderInstruction: RenderInstructionEffect<LanguageMetadata> =
	{
		renderInstruction:
			() => [["tertiary", "try translating this sentence!"]],
	};

export const implRenderCue: RenderCueEffect<LanguageMetadata> = {
	renderCue: (meta) => [["primary italic solid", `  ${meta.front}  `]],
};

export const implCreateHintMap = async (
	fx: EffectsOf<ReturnType<typeof makeHint>>,
): Promise<CreateHintMap<LanguageMetadata>> => {
	const fn = await makeHint().run(fx);
	return {
		createHintMap: (state) =>
			(meta) =>
				fn((word) => state.db.concepts[word])(
					meta.words,
				),
	};
};

export const implRenderCommands = (
	commands: [string, string][],
): RenderCommandsEffect => ({
	renderCommands: () => [
		[
			`secondary`,
			new Table(
				...commands.map(
					(cmd) => [colors.bold(cmd[0]), colors.italic(cmd[1])]
				),
			)
				.header([colors.underline.italic("commands")])
				//.border(true)
				.toString(),
		],
	],
});

export default <T>(validatorFn: (a0: unknown) => a0 is T) =>
	use<
		& PrinterEffect
		& UserInputEffect<Promise<string>>
		& RenderHintEffect<T>
		& RenderCueEffect<T>
		& RenderCommandsEffect
		& RenderInstructionEffect<T>
		& CreateHintMap<T>
	>()
		.map2(
			(fx) =>
				async (m: LangwitchMessage): Promise<LangwitchMessage> => {
					const meta = m.state.queue[0].metadata;

					if (validatorFn(meta)) {
						fx.print([
							//Cls,
							Br,
							...fx.renderInstruction(),
							["tertiary", "i believe in you ૮ ˶ᵔ ᵕ ᵔ˶ ა"],
							Br,
							...fx.renderCue(meta),
							Br,
							[
								"primary 80",
								`♡♡ hint: ${await fx.renderHint(meta)(
									fx.createHintMap(m.state)(meta),
								)}`,
							],
							Br,
							...fx.renderCommands(),
							Br,
						]);

						const userAnswer = await fx.ask("best guess?");
						return userAnswer === "" 
							? revisable(m).revise({
								data: {
									userAnswer: "",
									results: m.state.queue[0].concepts.map(c => [c, 1])
								},
								next: "feedback"
							}).contents

							: revisable(m).revise({
								data: {
									userAnswer,
								},
								next: "mark",
							}).contents;
					}
					return m;
				},
		);
// this could be generalised to
// (Metadata, CommandsList, Hint, Instruction) -> Component
