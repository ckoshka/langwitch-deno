import { isMatching, Message, revisable, State } from "../../../deps.ts";
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
			return revisable(m)
				.revise({next: "quiz"})
				.extend(() => ({data: null}))
				.mapR("state", s => s.map("queue", q => q.slice(1)))
				.contents;
		}
		return m;
	};
