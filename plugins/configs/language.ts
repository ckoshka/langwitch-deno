import { ImmutableMap } from "../../misc-packages-2/state_machine_2/deps.ts";
import { Machine } from "../../misc-packages-2/state_machine_2/mod.ts";
import {
	BaseContext,
	checkGraduation,
	Concept,
	Free,
	revisable,
	refresh,
	Rem,
	State,
	updateTopContext,
	use,
Revisable,
} from "../deps.ts";
import { implFileSystem } from "../io_effects/mod.ts";
import { LoadConceptsEffect } from "../state-transformers/mod.ts";
import backend from "./add_ons/backend/backend.ts";
import filterConcepts from "./add_ons/backend/filter_concepts.ts";
import filterContexts from "./add_ons/backend/filter_contexts.ts";
import conceptLoader from "./add_ons/backend/load_concepts.ts";
import noLogging from "./add_ons/backend/no_log.ts";
import params from "./add_ons/backend/params.ts";
import sorter from "./add_ons/backend/sort_contexts_2.ts";
import time from "./add_ons/backend/time.ts";
import { Exit, Has, implAudio, implSpeak, Known, Remove, Save, Stats } from "./add_ons/extras/mod.ts";
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
import { implStringMappings, implStringMappingsWithLatency } from "./add_ons/frontend/transforms.ts";
import { isLanguageMetadata, MachineWrapper } from "./shared/mod.ts";

const createState = use<LoadConceptsEffect>()
	.map2((fx) => fx.loadConcepts())
	.map((concepts) => refresh({ concepts }))
	.chain(checkGraduation)
	.chain(updateTopContext);

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
		.appendF("quiz", Stats());

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
) => revisable({
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

export const L1Config = revisable({
	...time,
	...noLogging,
	...params,
	...filterConcepts,
	...hinter,
	...io,
	...implStringMappings,
	...implMeasurePartialSimilarity,
	...implFileSystem,
	exit: () => Deno.exit(),
	...implAudio({mpvPath: "mpv"}),
	commands: [
		["!k", "mark known - !k word1 word2"],
		["!x", "exit"],
		["!r", "remove sentence"],
		["!has", "check if the sentence has a word - !has noche"],
	]
});

export const createL2Config = async (
	fxs: typeof L1Config["contents"],
) => revisable({
	...await implCreateHintMap(fxs),
	...implRenderHint(fxs),
	...implMarkUserAnswer(fxs),
	...implRenderCommands(fxs.commands as [string, string][]),
	...implRenderCue,
	...implRenderFeedback(fxs),
	...implRenderInstruction,
	sortContexts: (state: State) => (ctxs: BaseContext[]) =>
		sorter(state)(ctxs).run(fxs),
	...implSpeak(fxs)
});

type Depromisify<T> = T extends Promise<infer K> ? K : never;
type L0Revisable = Depromisify<ReturnType<typeof createL0Config>>;
type L1Revisable = typeof L1Config;
type L2Revisable = Depromisify<ReturnType<typeof createL2Config>>;

export type LangwitchConfig<A, B, C> = {
	init: {
		conceptsFile: string;
		sentencesFiles: string[];
		binariesFolder: string;
	};
	0?: (a0: L0Revisable) => Revisable<L0Revisable["contents"] & A>
	1?: (a0: Revisable<L1Revisable["contents"]>, fx: L0Revisable["contents"] & A) => Revisable<L1Revisable["contents"] & B>;
	2?: (a0: L2Revisable, fx: L1Revisable["contents"] & B & L0Revisable["contents"] & A) => Revisable<L2Revisable["contents"] & C>;
	3?: (a0: typeof LangwitchMachine) => MachineWrapper<any, any>;
};

export const startLangwitch = async <A, B, C>(cfg: LangwitchConfig<A, B, C>) => {
	const L0 = await createL0Config(cfg.init).then(l0 => cfg[0] ? cfg[0](l0) : l0);
	const L1 = cfg[1] ? cfg[1](L1Config, L0.contents as any) : L1Config;

	// L2 builds on L1. It mostly describes how to render higher-level components
	// e.g displaying hints, what instruction to display, etc.
	// This is where you'd override something like how the hinting works, or what commands are displayed.

	const L2 = await createL2Config(L1.contents).then((c) =>
		cfg[2] ? cfg[2](c, {...L1.contents, ...L0.contents} as any) : c
	);

	// L3 is the highest level. It describes LW's control-flow:
	// e.g quiz -> mark the answer
	// mark the answer -> process the scores
	// etc.
	// Here, you'd be adding new commands, running side-effects like text-to-speech, and so on.

	const L3 = cfg[3] ? cfg[3](LangwitchMachine).get() : LangwitchMachine.get();

	await initialiseLangwitch(L3).run({
		...L0.contents,
		...L1.contents,
		...L2.contents,
	})//.catch(console.error);
};
//TODO: Tap into the backend?