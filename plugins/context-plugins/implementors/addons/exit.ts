import { isMatching, Message, State, use } from "../../deps.ts";
import { ToMark } from "../message_types.ts";
import { SaveConceptsEffect } from "./save.ts";

export default (
	msg: Message<ToMark, State>,
) => use<SaveConceptsEffect>().map2((fx) => {
	if (!isMatching({ data: { answer: "!x" as const } }, msg)) {
		return msg;
	}

	fx.saveConcepts(Object.values(msg.state.db.concepts));

	return {
		data: null,
		state: msg.state,
		next: "exit",
	} as never;
});
