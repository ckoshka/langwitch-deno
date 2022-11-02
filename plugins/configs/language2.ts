// - machine with no effects
// - single revisable record for configuration
// - dynamic objects (i.e functions) loaded by dynamic import

import { Machine } from "../../misc-packages-2/state_machine_2/mod.ts";
import { isMatching, Message, State } from "../deps.ts";
import {
	Ask,
	Exit,
	implPartialStringSimilarity,
	implPreprocess,
	Known,
	LanguageFeedback,
	LanguageMarker,
	LanguageMetadata,
	LanguageQuiz,
	NextState,
	queueLens,
	Save,
	stateLens,
	Stats,
ToMark,
ToProcess,
} from "../context-plugins/mod.ts";

const Feedback = (m: Message<ToProcess, State>) =>({
    ...m,
    next: "process",
});

const Quiz = ({ state }: Message<ToMark, State>) =>({
    data: {
        next: "mark",
        msg: "best guess?",
    },
    state,
    next: "ask",
});

const Skip = (
	m: Message<ToMark, State>,
) => 
	isMatching({ data: { answer: "!s" as const } }, m)
		? stateLens.compose(queueLens).modify((q) => q.slice(1))(m)
		: m

Machine<State>()
    .add("feedback", Feedback)
    .add("quiz", Quiz)
