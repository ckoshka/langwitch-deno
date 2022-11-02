import { Message, Phase, State, use, UserInputEffect } from "../../deps.ts";
import { ToAsk } from "../message_types.ts";

export default Phase({
	phase: `ask`,
	fn: ({ state, data }: Message<ToAsk, State>) =>
		use<
			UserInputEffect<Promise<string>>
		>()
			.map2(async (fx) => {
				return {
					data: { answer: await fx.ask(data.msg) },
					state,
					next: data.next,
				};
			}),
});
