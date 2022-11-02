import { ExitEffect, isMatching, Message, State, use } from "../../deps.ts";
import { ToMark } from "../message_types.ts";
import { SaveConceptsEffect } from "./save.ts";

export default (
	msg: Message<ToMark, State>,
) => use<ExitEffect>().map2((fx) => {
	if (!isMatching({ data: { answer: "!x" as const } }, msg)) {
		return msg;
	}

	return fx.exit() as never;
});
