import { isMatching, Message, State, use } from "../../deps.ts";
import { stateLens, queueLens } from "../../helpers/lenses/state.ts";
import { ToMark } from "../message_types.ts";

export default (
	m: Message<ToMark, State>,
) => 
	isMatching({ data: { answer: "!s" as const } }, m)
		? stateLens.compose(queueLens).modify((q) => q.slice(1))(m)
		: m
;

