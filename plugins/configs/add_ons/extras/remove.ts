import { Message,State,isMatching } from "../../../deps.ts";
import { ToMark,stateLens,queueLens } from "../../../state-transformers/mod.ts";

export default (keyBinding = "!r") => (
	m: Message<ToMark, State>,
) => isMatching({ data: { answer: keyBinding } }, m)
	? stateLens.compose(queueLens).modify((q) => q.slice(1))(m)
	: m;
