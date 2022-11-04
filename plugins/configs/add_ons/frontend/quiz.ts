import { Br, Cls, Input, Line, use, UserInputEffect } from "../../../deps.ts";
import { makeHint } from "../../../hint-plugins/hint_effect.ts";
import { PrinterEffect } from "../../../state-transformers/helpers/effects/print.ts";
import { LangwitchMessage } from "../../../state-transformers/mod.ts";
import {
	fromEnv,
	importDefault,
	isLanguageMetadata,
} from "../../shared/mod.ts";

type Letter = string;
type Description = string;
export type AvailableCommandsReader = {
	commands: [Letter, Description][];
};

export default use<
	& PrinterEffect
	& AvailableCommandsReader
	& UserInputEffect<Promise<string>>
>()
	.chain(makeHint)
	.map(
		(hinter, fx) =>
		async (m: LangwitchMessage): Promise<LangwitchMessage> => {
			const meta = m.state.queue[0].id;

			if (isLanguageMetadata(meta)) {
				const cue = meta.front;
				const hint = hinter((n) => m.state.db.concepts[n])(
					meta.words,
				);
				const commands = fx.commands;

				fx.print([
					Cls,
					Br,
					["tertiary", "try translating this sentence!"],
					["tertiary", "i believe in you ૮ ˶ᵔ ᵕ ᵔ˶ ა"],
					Br,
					["primary italic solid", `  ${cue}  `],
					Br,
					["primary 80", `♡♡ hint: ${hint}`],
					Br,
					...commands.map((cmd) =>
						[
							[`secondary bold`, `!${cmd[0]}`],
							[`secondary`, ` => `],
							[`secondary italic`, `${cmd[1]}`],
						] as Line
					),
					Br,
				]);

				const userAnswer = await Input.prompt("best guess?");
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
