import { Free, Message, Phase, State, use } from "../../deps.ts";
import { useNothing } from "../../helpers/effects/use_empty.ts";
import { ToMark } from "../message_types.ts";

type Letter = string;
type Description = string;
export type AvailableCommandsReader = {
	commands: [Letter, Description][];
};

export default Phase({
	phase: `quiz`,
	fn: ({ state }: Message<ToMark, State>) =>
		useNothing(() => ({
			data: {
				next: "mark",
				msg: "best guess?",
			},
			state,
			next: "ask",
		})),
});
