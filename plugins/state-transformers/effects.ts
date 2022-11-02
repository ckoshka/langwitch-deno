import { BaseContext, Concept, Message, State } from "../deps.ts";
import { ToMark, ToProcess } from "./mod.ts";

export type LoadConceptsEffect = {};

// nextContexts etc. is a problem bcs -> effect that supplies another effect

export type FeedbackEffect = {
	showFeedback: (m: Message<ToProcess, State>) => Message<unknown, State>;
};

export type QuizEffect = {
	quiz: (m: Message<unknown, State>) => Message<unknown | ToMark, State>;
	// usually ToMark
};

export type InterpretEffect = {
	interpret: (m: Message<ToMark, State>) => Message<unknown, State>;
};

export type MarkerEffect = {
	mark: (m: Message<ToMark, State>) => Message<ToProcess | unknown, State>;
};

export type NextStateEffect = {
	nextState: (m: Message<ToProcess, State>) => Message<null, State>;
};
