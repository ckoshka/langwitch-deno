import { LanguageMetadata } from "../../context-types/mod.ts";
import { makeHint, Message, State, use } from "../../deps.ts";
import { GetMetadataEffect } from "../../helpers/effects/metadata.ts";
import { PrinterEffect } from "../../helpers/effects/print.ts";
import { ToMark } from "../message_types.ts";
import { StdoutEffect } from "./effs.ts";

type Letter = string;
type Description = string;
export type AvailableCommandsReader = {
	commands: [Letter, Description][];
};

export default (m: Message<ToMark, State>) =>
	use<
		& StdoutEffect
		& AvailableCommandsReader
		& GetMetadataEffect<LanguageMetadata>
	>()
		.chain(makeHint)
		.map(async (hint, fx) => {
			fx.writeStdout(JSON.stringify({
				state: m.state,
				hint: hint((n) => m.state.db.concepts[n])(
					fx.getMetadata(m.state.queue[0].id).words,
				),
				commands: fx.commands,
			}));
			return m;
		});
