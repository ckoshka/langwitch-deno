import { Free, State } from "../../deps.ts";
import {
	Machine,
	StateHandler,
} from "../../../misc-packages-2/state_machine_2/mod.ts";


export const MachineWrapper = <F, D>(machine: Free<Machine<State>, F, D>) => {
	return {
		addF: <F2, D2>(
			name: string,
			handler: Free<StateHandler<State>, F2, D2>,
		) => MachineWrapper(
			handler.chain((h) => machine.map((m) => m.add(name, h))),
		),
		add: (name: string, handler: StateHandler<State>) =>
			MachineWrapper(machine.map((m) => m.add(name, handler))),
		appendF: <F2, D2>(
			name: string,
			handler: Free<StateHandler<State>, F2, D2>,
		) => MachineWrapper(
			handler.chain((h) => machine.map((m) => m.appendTo(name, h))),
		),
		append: (name: string, handler: StateHandler<State>) =>
			MachineWrapper(machine.map((m) => m.appendTo(name, handler))),
		get: () => machine,
	};
};

export type MachineWrapper<F, D> = ReturnType<typeof MachineWrapper<F, D>>;
