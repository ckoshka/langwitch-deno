import { isMatching, Message, State } from "../../../deps.ts";
import {
	queueLens,
	stateLens,
	ToMark,
} from "../../../state-transformers/mod.ts";

export default (keyBinding = "!r") =>
	(
		m: Message<ToMark, State>,
	) => {
		if (m.data?.userAnswer?.toLowerCase().trim().startsWith(keyBinding)) {
			return {
				state: {
					...m.state,
					queue: m.state.queue.slice(1),
				},
				next: "quiz",
				data: null,
			};
		}
		return m;
	};
