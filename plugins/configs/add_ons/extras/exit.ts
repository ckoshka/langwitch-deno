import { ExitEffect, isMatching, Message, State, use } from "../../../deps.ts";
import { ToMark } from "../../../state-transformers/mod.ts";

export default (keyBinding = "!x") =>
	use<ExitEffect>().map2((fx) =>
	(
		msg: Message<ToMark, State>,
	) => {
		if (
			!msg.data?.userAnswer?.toLowerCase().trim().startsWith(keyBinding)
		) {
			return msg;
		}

		return fx.exit() as never;
	});
