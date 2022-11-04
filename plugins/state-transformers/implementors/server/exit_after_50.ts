import { Message, State } from "../../deps.ts";
import { ToMark } from "../message_types.ts";

export default (max: number) => {
	let total = 0;
	return (
		msg: Message<ToMark, State>,
	) => {
		total += 1;
		if (total > max * 3) {
			return {
				data: null,
				state: msg.state,
				next: "exit",
			} as never;
		} else {
			return msg;
		}
	};
};
