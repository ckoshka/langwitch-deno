import {
	Br,
	Cls,
	Component,
	Concept,
	ConceptName,
	EffectsOf,
	Input,
	Line,
	State,
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

// params: how to hint, what metadata:
// check if right metadata, what instructions, what cue, what commands

export type RenderHintEffect<Meta> = {
	renderHint: (state: State) => (metadata: Meta) => Component;
};

export type RenderCueEffect<Meta> = {
	renderCue: (metadata: Meta) => Component;
};

export type RenderCommandsEffect = {
	renderCommands: () => Component;
};

export type RenderInstructionEffect<T> = {
	renderInstruction: () => Component;
}

export const implRenderInstruction: RenderInstructionEffect<LanguageMetadata> = {
	renderInstruction: () => [["tertiary", "try translating this sentence!"]]
}

export const implRenderCue: RenderCueEffect<LanguageMetadata> = {
	renderCue: (meta) => [["primary italic solid", `  ${meta.front}  `]]
};

export const implCreateHint = async (
	fx: EffectsOf<ReturnType<typeof makeHint>>,
): Promise<RenderHintEffect<LanguageMetadata>> => {
	const fn = await makeHint().run(fx);
	return {
		renderHint: (state) =>
			(meta) => [[
				"primary 80",
				`♡♡ hint: ${
					fn((word) => state.db.concepts[word])(
						meta.words,
					)
				}`,
			]],
	};
};

export const implRenderCommands = (
	commands: [string, string][],
): RenderCommandsEffect => ({
	renderCommands: () =>
		commands.map((cmd) =>
			[
				[`secondary bold`, `!${cmd[0]}`],
				[`secondary`, ` => `],
				[`secondary italic`, `${cmd[1]}`],
			] as Line
		),
});

export default <T>(validatorFn: (a0: unknown) => a0 is T) => use<
	& PrinterEffect
	& UserInputEffect<Promise<string>>
	& RenderHintEffect<T>
	& RenderCueEffect<T>
	& RenderCommandsEffect
	& RenderInstructionEffect<T>
>()
	.chain(makeHint)
	.map(
		(hinter, fx) =>
			async (m: LangwitchMessage): Promise<LangwitchMessage> => {
				const meta = m.state.queue[0].metadata;

				if (validatorFn(meta)) {
					fx.print([
						Cls,
						Br,
						...fx.renderInstruction(),
						["tertiary", "i believe in you ૮ ˶ᵔ ᵕ ᵔ˶ ა"],
						Br,
						...fx.renderCue(meta),
						Br,
						...fx.renderHint(m.state)(meta),
						Br,
						...fx.renderCommands(),
						Br,
					]);

					const userAnswer = await fx.ask("best guess?");
					return {
						data: {
							userAnswer,
						},
						state: m.state,
						next: "mark",
					};
				}
				return m;
			},
	);
// this could be generalised to
// (Metadata, CommandsList, Hint, Instruction) -> Component
