import { Machine, StateHandler } from "../../misc-packages-2/state_machine_2/mod.ts";
import {
	checkGraduation,
	Free,
	MarkedResult,
	Message,
	nextState,
	refresh,
	revisable,
	State,
	updateTopContext,
	use,
} from "../deps.ts";
import { MachineEffect, ToProcess } from "../state-transformers/mod.ts";
import backend from "./add_ons/backend/backend.ts";
import filterConcepts from "./add_ons/backend/filter_concepts.ts";
import filterContexts from "./add_ons/backend/filter_contexts.ts";
import conceptLoader from "./add_ons/backend/load_concepts.ts";
import noLogging from "./add_ons/backend/no_log.ts";
import params from "./add_ons/backend/params.ts";
import sorter from "./add_ons/backend/sort_contexts.ts";
import time from "./add_ons/backend/time.ts";
import {
	default as Feedback,
	implRenderFeedback,
} from "./add_ons/frontend/feedback.ts";
import hinter from "./add_ons/frontend/hinter.ts";
import io from "./add_ons/frontend/io.ts";
import {
	default as Mark,
	implMarkUserAnswer,
} from "./add_ons/frontend/mark.ts";
import {
	default as Quiz,
	implCreateHint,
	implRenderCommands,
	implRenderCue,
	implRenderInstruction,
} from "./add_ons/frontend/quiz.ts";
import { isLanguageMetadata } from "./shared/is_language_metadata.ts";

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
		}) // if i could freeze this in, the machine could be freely passed around?
	);

const MachineWrapper = <Effs>(machine: Free<Machine<State>, Effs>) => {
	return {
		addF: (name: string, handler: Free<StateHandler<State>>) => MachineWrapper(handler.chain(h => machine.map(m => m.add(name, h)))),
		add: (name: string, handler: StateHandler<State>) => MachineWrapper(machine.map(m => m.add(name, handler))),
		appendF: (name: string, handler: Free<StateHandler<State>>) => MachineWrapper(handler.chain(h => machine.map(m => m.appendTo(name, h)))),
		append: (name: string, handler: StateHandler<State>) => MachineWrapper(machine.map(m => m.appendTo(name, handler))),
	}
}

const commands: [string, string][] = [
	["k", "mark known"],
	["x", "exit"],
	["s", "skip sentence"],
];

// todo: turn this into a revisable record

export const createBackend = async (
	{ conceptsFile, sentencesFile, binariesFolder }: {
		conceptsFile: string;
		sentencesFile: string;
		binariesFolder: string;
	},
) => ({
	// it's just these parts that require the filenames

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

export const defaultConfig = revisable({
	...time,
	...noLogging,
	...params,
	...filterConcepts,
	sortContexts: sorter,
	...hinter,
	...io
});

export const phases = async (fxs: typeof defaultConfig.contents) => revisable({
	...await implCreateHint(fxs),
	...implMarkUserAnswer,
	...implRenderCommands([]),
	...implRenderCue,
	...implRenderFeedback,
	...implRenderInstruction,
});

export const makePhases = async (fxs: ReturnType<typeof phases>["contents"]) => revisable({
	mark: await Mark(isLanguageMetadata).run(fxs),
	quiz: await Quiz(isLanguageMetadata).run({ ...visuals, ...time, ...params, ...fxs }),
	showFeedback: await Feedback(isLanguageMetadata).run(fxs),
	interpret: (
		m: Message<{
			userAnswer: string;
		}, State>,
	) => m,
})