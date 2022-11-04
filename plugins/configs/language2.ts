import { Machine } from "../../misc-packages-2/state_machine_2/mod.ts";
import {
	checkGraduation,
	MarkedResult,
	Message,
	nextState,
	refresh,
	State,
	updateTopContext,
	use,
} from "../deps.ts";
import { MachineEffect, ToProcess } from "../state-transformers/mod.ts";
import filterContexts from "./add_ons/backend/filter_contexts.ts";
import hinter from "./add_ons/frontend/hinter.ts";
import io from "./add_ons/frontend/io.ts";
import noLogging from "./add_ons/backend/no_log.ts";
import time from "./add_ons/backend/time.ts";
import filterConcepts from "./add_ons/backend/filter_concepts.ts";
import params from "./add_ons/backend/params.ts";
import sorter from "./add_ons/backend/sort_contexts.ts";
import mark from "./add_ons/frontend/mark.ts";
import quiz from "./add_ons/frontend/quiz.ts";
import feedback from "./add_ons/frontend/feedback.ts";
import conceptLoader from "./add_ons/backend/load_concepts.ts";
import backend from "./add_ons/backend/backend.ts";

export type LangwitchEffect = Parameters<typeof Langwitch.run>[0];

export const Langwitch = use<MachineEffect>()
	.map2((fx) => fx.loadConcepts())
	.chain((concepts) => refresh({ concepts }))
	.chain(checkGraduation)
	.chain(updateTopContext)
	.map((
		state,
		fx,
	) => Machine<State>()
		.add("feedback", fx.showFeedback)
		.add("quiz", fx.quiz)
		.appendTo("quiz", fx.interpret)
		.add("mark", fx.mark)
		.add("process", async (m: Message<ToProcess, State>) => ({
			state: await nextState(m.state)(m.data.results as MarkedResult)
				.run(fx),
			data: null,
			next: "quiz",
		}))
		.start("quiz", {
			data: null,
			next: "",
			state,
		})
	);

const commands = {
	commands: <[string, string][]> [
		["k", "mark known"],
		["x", "exit"],
		["s", "skip sentence"],
	],
};

const visuals = {
	...hinter,
	...commands,
	...io,
};

export const run = async (
	conceptsFile: string,
	sentencesFile: string,
	binariesFolder: string,
) => Langwitch.run({
	...time,
	...noLogging,
	...params,
	...filterConcepts,
	sortContexts: sorter,
	interpret: (m) => m,
	mark,
	quiz: await quiz.run({ ...visuals, ...time, ...params }),
	showFeedback: await feedback.run({ ...visuals }),

	...conceptLoader(conceptsFile),
	...await backend({
		sentencesFile,
		filterCtxs: (ctxs) => filterContexts(ctxs, (c) => c),
		knownWords: await conceptLoader(conceptsFile).loadConcepts().then(
			Object.keys,
		),
		binariesFolder,
	}),
});
