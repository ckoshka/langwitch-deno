// deno-lint-ignore-file no-explicit-any

import { ExcludeProps, use } from "./deps.ts";
import { Message, PhaseData } from "./types.ts";

export type Machine<State, Effs> = ReturnType<typeof Machine<State, Effs>>;

export const Machine = <
	T,
	CurEffs = Record<never, never>,
	CurDerived = Record<never, never>,
>(
	states: Record<string, PhaseData<any, any, T, any, any>> = {},
) => {
	return {
		add: <Out, Effs, DerivedEffs>(
			handler: PhaseData<Out, any, T, Effs, DerivedEffs>,
		) => {
			return Machine<T, CurEffs & Effs, CurDerived & DerivedEffs>({
				...states,
				[handler.phase]: handler,
			});
		},
		run: (start: string, data: Message<null, T>) => {
			return use<ExcludeProps<CurEffs, CurDerived>>().map2(
				async (fxs) => {
					let nextState = start;
					let currData = data;
					for (;;) {
						const packet = await states[nextState].fn(currData).run(
							fxs,
						);
						nextState = packet.next;
						if (nextState === "exit") {
							break;
						}
						currData = packet;
					}
				},
			);
		},
	};
};
