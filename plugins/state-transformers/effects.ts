import { Async, BaseContext, Concept, Message, State } from "../deps.ts";
import { LangwitchMessage, ToMark, ToProcess } from "./mod.ts";
export type OptionalAsync<T extends Record<string, (...args: any[]) => any>> =
	| T
	| Async<T>;

export type LoadConceptsEffect = OptionalAsync<{
	loadConcepts: () => Record<string, Concept>;
}>;

// nextContexts etc. is a problem bcs -> effect that supplies another effect

export type FeedbackEffect = OptionalAsync<{
	showFeedback: (m: Message<ToProcess, State>) => LangwitchMessage;
}>;

export type QuizEffect = OptionalAsync<{
	quiz: (m: LangwitchMessage) => LangwitchMessage;
	// usually ToMark
}>;

export type InterpretEffect = OptionalAsync<{
	interpret: (m: Message<ToMark, State>) => LangwitchMessage;
}>;

export type MarkerEffect = OptionalAsync<{
	mark: (m: Message<ToMark, State>) => LangwitchMessage;
}>;
export type MachineEffect =
	& LoadConceptsEffect
	& FeedbackEffect
	& QuizEffect
	& InterpretEffect
	& MarkerEffect;
