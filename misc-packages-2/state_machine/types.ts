import { Free } from "./deps.ts";

export type Message<T, S> = {
	data: T;
	state: S;
	next: string;
};

export type FnRecord = Record<string, any>;
export type PhaseData<Out, MessageInput, StateType, Effs extends FnRecord, DerivedEffs extends FnRecord> = {
	phase: string;
	fn: (
		input: Message<MessageInput, StateType>,
	) => Free<Message<Out, StateType>, Effs, DerivedEffs>;
};

