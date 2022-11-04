import { LanguageMetadata } from "../../context-types/mod.ts";
import { makeHint, Message, Phase, State, use } from "../../deps.ts";
import { GetMetadataEffect } from "../../helpers/effects/metadata.ts";
import { PrinterEffect } from "../../helpers/effects/print.ts";
import { ToMark } from "../message_types.ts";
import { ShowPrompt } from "./showable.ts";

type Letter = string;
type Description = string;
export type AvailableCommandsReader = {
	commands: [Letter, Description][];
};

export default (m: Message<ToMark, State>) =>
	use<
		& PrinterEffect
		& GetMetadataEffect<LanguageMetadata>
		& AvailableCommandsReader
	>()
		.chain(makeHint)
		.map(async (hint, fx) => {
			const meta = fx.getMetadata(m.state.queue[0].id);

			fx.print(ShowPrompt({
				cue: meta.front,
				hint: hint((n) => m.state.db.concepts[n])(
					meta.words,
				),
				commands: fx.commands,
			}));

			return m;
		});
