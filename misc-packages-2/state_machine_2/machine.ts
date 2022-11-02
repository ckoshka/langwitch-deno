import { Message } from "./types.ts";

export type StateHandler<State> = (
	a0: Message<any, State>,
) => Message<any, State> | Promise<Message<any, State>>;

export const Machine = <State>(
	states: Record<string, StateHandler<State>> = {},
) => {
	return {
		add: (
			name: string,
			handler: StateHandler<State>,
		) => {
			return Machine<State>({
				...states,
				[name]: handler,
			});
		},
		appendTo: (
			name: string,
			handler: StateHandler<State>,
		) => {
			return Machine<State>({
				...states,
				[name]: async m => handler(await states[name](m)),
			});
		},
		prependTo: (
			name: string,
			handler: StateHandler<State>,
		) => {
			return Machine<State>({
				...states,
				[name]: async m => states[name](await handler(m)),
			});
		},
		run: async (start: string, data: Message<null, State>) => {
			let nextState = start;
			let currData = data;
			for (;;) {
				const packet = await states[nextState](currData);
				nextState = packet.next;
				if (nextState === "exit") {
					break;
				}
				currData = packet;
			}
		},
	};
};
