import { Free, MarkedResult, State } from "../../deps.ts";
import { checkGraduation } from "./check_graduation.ts";
import { markAndUpdate, updateTopContext } from "./handle_feedback.ts";
import { refresh } from "./handle_refresh.ts";

export const handleSessionRefresh = (s1: State) =>
	refresh(s1.db).chain((s2) => checkGraduation(s2)).chain((s3) =>
		updateTopContext(s3)
	);

/**
 * Marks concepts, checks if any have graduated, and reorders the contexts.
 */
export const nextState = (s1: State) => (feedback: MarkedResult) =>
	markAndUpdate(s1)(feedback)
		.chain((s2) => checkGraduation(s2))
		.chain((s3) => updateTopContext(s3));
