import { ImmutableMap } from "../../misc-packages-2/state_machine_2/deps.ts";
import { Machine } from "../../misc-packages-2/state_machine_2/mod.ts";
import {
	BaseContext,
	checkGraduation,
	Concept,
	Free,
	modifiable,
	refresh,
	Rem,
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
import sorter from "./add_ons/backend/sort_contexts_2.ts";
import time from "./add_ons/backend/time.ts";
import { Exit, Has, Known, Remove, Save, Stats } from "./add_ons/extras/mod.ts";
import {
	default as Feedback,
	implRenderFeedback,
} from "./add_ons/frontend/feedback.ts";
import hinter from "./add_ons/frontend/hinter.ts";
import io from "./add_ons/frontend/io.ts";
import {
	default as Mark,
	implMarkUserAnswer,
implMeasurePartialSimilarity,
} from "./add_ons/frontend/mark.ts";
import Process from "./add_ons/frontend/process.ts";
import {
	default as Quiz,
	implCreateHintMap,
	implRenderCommands,
	implRenderCue,
	implRenderHint,
	implRenderInstruction,
} from "./add_ons/frontend/quiz.ts";
import { implStringMappings } from "./add_ons/frontend/transforms.ts";
import { isLanguageMetadata, MachineWrapper } from "./shared/mod.ts";

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
	.addF("process", Process);

export const addExit = <F, D>(machine: MachineWrapper<F, D>) =>
	machine.appendF("quiz", Exit("!x"));

export const addMarkKnown = <F, D>(machine: MachineWrapper<F, D>) =>
	machine.appendF("quiz", Known("!k"));
export const addRemove = <F, D>(machine: MachineWrapper<F, D>) =>
	machine.append("quiz", Remove("!r"));

export const addSave = <F, D>(machine: MachineWrapper<F, D>) =>
	machine
		.appendF("process", Save);

export const addStats = <F, D>(machine: MachineWrapper<F, D>) =>
	machine
		.appendF("quiz", Has);

export const addExtraHinter = <F, D>(machine: MachineWrapper<F, D>) =>
	machine.appendF("quiz", Has);

export const addCommands = <F, D>(machine: MachineWrapper<F, D>) =>
	Rem.pipe(
		machine,
		addExit,
		addMarkKnown,
		addRemove,
		addSave,
		addStats,
		addExtraHinter,
	);

export const initialiseLangwitch = <F, D>(lw: Free<Machine<State>, F, D>) =>
	lw
		.chain((m) =>
			createState.map((s) =>
				m.start("quiz", {
					data: null,
					next: "",
					state: s,
					map: ImmutableMap(),
				})
			)
		);

export const createL0Config = async (
	{ conceptsFile, sentencesFiles, binariesFolder }: {
		conceptsFile: string;
		sentencesFiles: string[];
		binariesFolder: string;
	},
) => modifiable({
	...conceptLoader(conceptsFile),
	...await backend({
		sentencesFiles,
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
	},
});

export const L1Config = modifiable({
	...time,
	...noLogging,
	...params,
	...filterConcepts,
	...hinter,
	...io,
	...implStringMappings,
	...implMeasurePartialSimilarity,
	exit: () => Deno.exit(),
});

export const createL2Config = async (
	fxs: ReturnType<typeof L1Config["get"]>,
) => modifiable({
	...await implCreateHintMap(fxs),
	...implRenderHint(fxs),
	...implMarkUserAnswer(fxs),
	...implRenderCommands([
		["k", "mark known"],
		["x", "exit"],
		["r", "remove sentence"],
		["has", "check if the sentence has a word, i.e !has noche"],
	]),
	...implRenderCue,
	...implRenderFeedback(fxs),
	...implRenderInstruction,
	sortContexts: (state: State) => (ctxs: BaseContext[]) =>
		sorter(state)(ctxs).run(fxs),
});

type Depromisify<T> = T extends Promise<infer K> ? K : never;

export type LangwitchConfig = {
	0: {
		conceptsFile: string;
		sentencesFiles: string[];
		binariesFolder: string;
	};
	1?: Parameters<typeof L1Config.modify>[0];
	2?: Parameters<Depromisify<ReturnType<typeof createL2Config>>["modify"]>[0];
	3?: (a0: typeof LangwitchMachine) => MachineWrapper<any, any>;
};

export const startLangwitch = async (cfg: LangwitchConfig) => {
	const L0 = await createL0Config(cfg[0]);
	const L1 = cfg[1] ? L1Config.modify(cfg[1]) : L1Config;

	// L2 builds on L1. It mostly describes how to render higher-level components
	// e.g displaying hints, what instruction to display, etc.
	// This is where you'd override something like how the hinting works, or what commands are displayed.

	const L2 = await createL2Config(L1.get()).then((c) =>
		cfg[2] ? c.modify(cfg[2]) : c
	);

	// L3 is the highest level. It describes LW's control-flow:
	// e.g quiz -> mark the answer
	// mark the answer -> process the scores
	// etc.
	// Here, you'd be adding new commands, running side-effects like text-to-speech, and so on.

	const L3 = cfg[3] ? cfg[3](LangwitchMachine).get() : LangwitchMachine.get();

	await initialiseLangwitch(L3).run({
		...L0.get(),
		...L1.get(),
		...L2.get(),
	}).catch(console.error);
};
