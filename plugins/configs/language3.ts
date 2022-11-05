import { Machine } from "../../misc-packages-2/state_machine_2/mod.ts";
import {
	checkGraduation,
	Concept,
	Free,
	modifiable,
	refresh,
	revisable,
	State,
	updateTopContext,
	use,
} from "../deps.ts";
import { LoadConceptsEffect } from "../state-transformers/mod.ts";
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
import Process from "./add_ons/frontend/process.ts";
import {
	default as Quiz,
	implCreateHint,
	implRenderCommands,
	implRenderCue,
	implRenderInstruction,
} from "./add_ons/frontend/quiz.ts";
import { isLanguageMetadata, MachineWrapper } from "./shared/mod.ts";
import { Exit, Known, Remove, Save, Stats } from "./add_ons/extras/mod.ts";

const createState = use<LoadConceptsEffect>()
	.map2((fx) => fx.loadConcepts())
	.chain((concepts) => refresh({ concepts }))
	.chain(checkGraduation)
	.chain(updateTopContext);
// TODO: Add Save, Stats, 

export const LangwitchMachine = MachineWrapper(Free.lift(Machine<State>()))
	.addF("mark", Mark(isLanguageMetadata))
	.addF("quiz", Quiz(isLanguageMetadata))
	.addF("feedback", Feedback(isLanguageMetadata))
	.addF("process", Process)

export const initialiseLangwitch = <F, D>(lw: Free<Machine<State>, F, D>) =>
	lw
		.chain((m) =>
			createState.map((s) =>
				m.start("quiz", {
					data: null,
					next: "",
					state: s,
				})
			)
		);

export const createL0Config = async (
	{ conceptsFile, sentencesFile, binariesFolder }: {
		conceptsFile: string;
		sentencesFile: string;
		binariesFolder: string;
	},
) => modifiable({
	...conceptLoader(conceptsFile),
	...await backend({
		sentencesFile,
		filterCtxs: (ctxs) => filterContexts(ctxs, (c) => c),
		knownWords: await conceptLoader(conceptsFile).loadConcepts().then(
			Object.keys,
		),
		binariesFolder,
	}),
	saveConcepts: async (c: Concept[]) => {
		await Deno.writeTextFile(
			conceptsFile,
			JSON.stringify(c),
		);
	}
});

export const L1Config = modifiable({
	...time,
	...noLogging,
	...params,
	...filterConcepts,
	sortContexts: sorter,
	...hinter,
	...io,
	exit: () => Deno.exit()
});

export const createL2Config = async (fxs: Parameters<typeof implCreateHint>[0]) =>
modifiable({
		...await implCreateHint(fxs),
		...implMarkUserAnswer,
		...implRenderCommands([["k", "mark known"], ["x", "exit"], [
			"r",
			"remove sentence",
		]]),
		...implRenderCue,
		...implRenderFeedback,
		...implRenderInstruction,
	});

// DONE: try putting it all together, see what's missing
// TODO: Provide at least five examples of modifying Langwitch
// maybe use immer instead of revisable?
// TODO: Make adding the command stuff optional
/*

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

*/
