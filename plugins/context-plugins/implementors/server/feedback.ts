import { Message, State, use } from "../../deps.ts";
import { ToProcess } from "../message_types.ts";
import { StdoutEffect } from "./effs.ts";

export default (m: Message<ToProcess, State>) =>
	use<
		StdoutEffect
	>().map2(async (fx) => {
		await fx.writeStdout(JSON.stringify(m.data));
		return m;
	});
