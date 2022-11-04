import { Free, Message, Phase, State, use } from "../../deps.ts";
import { useNothing } from "../../helpers/effects/use_empty.ts";
import { ToProcess } from "../message_types.ts";

export default Phase({
	phase: `feedback`,
	fn: (m: Message<ToProcess, State>) =>
		useNothing(() => ({
			...m,
			next: "process",
		})),
});
