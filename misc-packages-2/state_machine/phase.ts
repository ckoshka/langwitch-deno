import { Free } from "./deps.ts";
import { FnRecord, Message, type PhaseData } from "./types.ts";

export const Phase = <Out, MessageInput, StateType, Effs extends FnRecord, DerivedEffs extends FnRecord>(
	phase: PhaseData<Out, MessageInput, StateType, Effs, DerivedEffs>,
) => {
	return {
		...phase,
		afterF: <Effs2 extends FnRecord, DerivedEffs2 extends FnRecord, NewOut>(
			fn: (
				output: Message<Out, StateType>,
			) => Free<Message<NewOut, StateType>, Effs2, DerivedEffs2>,
		) => {
			return Phase<NewOut, MessageInput, StateType, Effs & Effs2, DerivedEffs>({
				...phase,
				fn: (input: Message<MessageInput, StateType>) => phase.fn(input).chain(fn),
			});
		},
		beforeF: <Effs2 extends FnRecord, DerivedEffs2 extends FnRecord>(
			fn: (input: Message<MessageInput, StateType>) => Free<Message<MessageInput, StateType>, Effs2, DerivedEffs2>,
		) => {
			return Phase<Out, MessageInput, StateType, Effs & Effs2, DerivedEffs2>({
				...phase,
				fn: (input: Message<MessageInput, StateType>) => fn(input).chain(phase.fn),
			});
		},
		after: <NewOut>(
			fn: (
				output: Message<Out, StateType>,
			) => Message<NewOut, StateType>,
		) => {
			return Phase<NewOut, MessageInput, StateType, Effs, DerivedEffs>({
				...phase,
				fn: (input: Message<MessageInput, StateType>) => phase.fn(input).map(fn),
			});
		},
		before: (
			fn: (input: Message<MessageInput, StateType>) => Message<MessageInput, StateType>,
		) => {
			return Phase<Out, MessageInput, StateType, Effs, DerivedEffs>({
				...phase,
				fn: (input: Message<MessageInput, StateType>) => phase.fn(fn(input)),
			});
		}
	};
};
