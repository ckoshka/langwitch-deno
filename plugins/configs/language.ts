import { initialiseMixedBackend } from "../backends/mixed/mod.ts";
import { maximiseEase } from "../concept-selection/mod.ts";
import {
	checkGraduation,
	Concept,
	EffectsOf,
	ensure,
	hiderFromMsgpackUrl,
	Input,
	Machine,
	refresh,
	revisable,
	sortInfallible,
	State,
	updateTopContext,
	use,
} from "../deps.ts";
import { implFileSystem } from "../io_effects/mod.ts";
import { filterArr, languageConfig } from "../preprocessing/language/mod.ts";

import {
	Ask,
	Exit,
	Feedback,
	implPartialStringSimilarity,
	implPreprocess,
	Known,
	LanguageFeedback,
	LanguageMarker,
	LanguageMetadata,
	LanguageQuiz,
	NextState,
	Quiz,
	Save,
	Skip,
	Stats,
} from "../state-transformers/mod.ts";
import { processLine, tokenize } from "../preprocessing/mod.ts";
import { DefaultConfigReader } from "./config_reader.ts";
import { style } from "./theme.ts";
import { ensureSentences, readConcepts } from "./readers.ts";
import { implUniversals } from "./universals.ts";
import { Component } from "../deps.ts";

export const createSession = () =>
	use<DefaultConfigReader>()
		.chain(ensureSentences)
		.chain(readConcepts)
		.map((conceptsMap, fx) => ({
			machine: refresh({ concepts: conceptsMap })
				.chain(checkGraduation)
				.chain(updateTopContext)
				.chain(async (state) =>
					Machine<State>()
						.add(
							Feedback.beforeF(LanguageFeedback),
						)
						.add(Quiz.beforeF(LanguageQuiz))
						.add(Ask.afterF(Exit).afterF(Known).after(Skip))
						.add(LanguageMarker)
						.add(NextState.afterF(Stats<null>()).afterF(Save)) // why not implement these as effects?
						.run("quiz", {
							data: null,
							next: "",
							state,
						})
				),
			backend: initialiseMixedBackend,
			conceptsMap
		}));
// use effectsOf
const interpreter = await languageConfig.map((c) =>
	processLine<string, LanguageMetadata>(c.contents as any)
).run({
	tokenize: tokenize({
		granularity: "word",
		filterIsWordLike: true,
	}),
});

export default () =>
	createSession().map(
		async ({ backend: backendMonad, machine, conceptsMap }, cfg) => {

			type BackendEffect = Parameters<typeof backendMonad.run>[0];

			type MachineEffect = Omit<Parameters<typeof machine.run>[0], "getMetadata" | "nextContexts" | "nextConcepts">;

			const run = (backendFx: BackendEffect) => async (machineFx: MachineEffect) => {
				const backend = await backendMonad.run(backendFx);
				await machine.run({...backend, ...machineFx});
			}

			const backendArgs = <BackendEffect>{
				backend: {
					sentencesFile: cfg.sentencesFile,
					desiredWords: [],
					maximumWordsToQueue: 25,
					wordlistMaximumIterSteps: 15,
					knownWords: Object.values(conceptsMap).map((c) => c.name),
					toContext: interpreter,
					filterCtxs: (ctxs) => filterArr(ctxs, (m) => m),
					eachWordCallback: (c) => console.log(c),
				},
				bins: {
					dicer: `${cfg.binariesFolder}/dicer`,
					encoder: `${cfg.binariesFolder}/langwitch_encode`,
					frequencyChecker: `${cfg.binariesFolder}/frqcheck_opt`,
					wordlist: `${cfg.binariesFolder}/wordlist`,
				},
				...implFileSystem
			}

			const machineArgs = <MachineEffect>{
				...implUniversals,
				...implPartialStringSimilarity(),
				...implPreprocess(),

				hider: await hiderFromMsgpackUrl(
					`https://github.com/ckoshka/langwitch_hider/raw/master/assets/frequency_table.msgpack`,
				),
				saveConcepts: async (c) => {
					await Deno.writeTextFile(
						cfg.conceptsFile,
						JSON.stringify(c),
					);
				},
				commands: [
					["k", "mark known"],
					["x", "exit"],
					["s", "skip sentence"],
				],
				filterConcepts: (cxs: string[], n: number) => {
					const res = sortInfallible([
						[maximiseEase(cxs), 0.5],
					]).slice(0, n);
					return res;
				},

				print: (s: Component) => console.log(style(s)),
				tap: (_) => (t) => t,
				ask: (s) => Input.prompt(s || "best guess?"),
				log: (_) => {},
				exit: () => Deno.exit()
			};

			return {backend: backendArgs, machine: machineArgs, run}
		},
	).implF(() => implFileSystem);
