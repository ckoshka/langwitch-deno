import { initialiseMixedBackend } from "../backends/mixed/mod.ts";
import {
	maximiseEase
} from "../concept-selection/mod.ts";
import {
	checkGraduation,
	Concept,
	ensure, hiderFromMsgpackUrl, Machine,
	makeRecord,
	refresh, sortInfallible, State,
	updateTopContext,
	use
} from "../deps.ts";
import { implFileSystem } from "../io_effects/mod.ts";
import {
	filterArr,
	languageConfig
} from "../preprocessing/language/mod.ts";

import {
	Ask, Feedback, implPartialStringSimilarity,
	implPreprocess, implUniversals, LanguageMetadata, NextState,
	Quiz,
	Save,
	ServerFeedback, ServerQuiz, ExitAfter, LanguageMarker
} from "../context-plugins/mod.ts";
import { processLine, tokenize } from "../preprocessing/mod.ts";

export type DefaultConfigReader = {
	languageName: string;
	binariesFolder: string;
	homeFolder: string;
	dataFolder: string;
	known: Concept[];
};

export const startSession = use<DefaultConfigReader>().map2(async (cfg) => {
	const sentencesFolder = `${cfg.dataFolder}/${cfg.languageName}`;

	let concepts: Concept[] = await ensure({
		try: () =>
			Deno.readTextFile(
				`${cfg.homeFolder}/concepts/${cfg.languageName}.json`,
			).then(JSON.parse),
		catch: async () => {
			await Deno.writeTextFile(
				`${cfg.homeFolder}/concepts/${cfg.languageName}.json`,
				`[]`,
			);
			return [];
		},
	});

	concepts = concepts.filter((c) => c.timesSeen > 3);
	//console.log(concepts);

	const makeMachine = refresh({ concepts: makeRecord(concepts, c => c.name) }) // expose this
		.chain(checkGraduation)
		.chain(updateTopContext)
		.chain((state: State) => {
			return Machine<State>()
				.add(Feedback.beforeF(ServerFeedback)) // add here
				.add(Quiz.beforeF(ServerQuiz)) // add here
				.add(Ask.after(ExitAfter(30)))
				.add(LanguageMarker)
				.add(NextState.afterF(Save)) // this could be extracted ou
				// i.e machine goes on the outside, the state is the last part.
				.run("quiz", {
					data: null,
					next: "",
					state,
				});
		});

	await initialiseMixedBackend(
		{
			sentences: sentencesFolder,
			desiredWords: [],
			knownWords: concepts.map(c => c.name),
			toContext: await languageConfig.map((c) =>
				processLine<string, LanguageMetadata>(c.contents as any)
			).run({
				tokenize: tokenize({
					granularity: "word",
					filterIsWordLike: true,
				}),
			}),
					maximumWordsToQueue: 35,
					wordlistMaximumIterSteps: 15,
					filterCtxs: (ctxs) => filterArr(ctxs, (m) => m),
					eachWordCallback: (c) => console.log(c),
			}).map(async (backend) => {
		await makeMachine.run({ // ok, so extract this out, flatten it. const backend = initialiseMixedBackend(...)
			// then implF the backend on the flattened monad
			...implUniversals,
			...implPartialStringSimilarity(),
			...implPreprocess(),
			tap: (_) => (t) => t,
			...backend,
			hider: await hiderFromMsgpackUrl(
				`https://github.com/ckoshka/langwitch_hider/raw/master/assets/frequency_table.msgpack`,
			),
			ask: (s) => Promise.resolve(""),
			log: (s) => {},
			saveConcepts: (c) => {
				Deno.writeTextFileSync(
					`${cfg.homeFolder}/concepts/${cfg.languageName}.json`,
					JSON.stringify(c),
				);
			},
			commands: [
				["k", "mark known"],
				["x", "exit"],
				["s", "skip sentence"],
			],
			filterConcepts: (cxs, n) => {
				const res = sortInfallible([
					//[maximiseDissimilarity(cxs), 0.5],
					[maximiseEase(cxs), 1.0],
				]).slice(0, n);
				//console.log(res);
				return res;
			},
			writeStdout: (data) => {
				const stuff = JSON.parse(data);
				try {
					console.log(JSON.stringify({
						topCtx: {
							back: stuff.state.queue[0].metadata.back,
							front: stuff.state.queue[0].metadata.front,
						},
						hint: stuff.hint,
						knownCount: stuff.state.stats.knownCount
					}));
				} catch {
					//
				}
			},
		});
	}).run({
		bins: {
			dicer: `${cfg.binariesFolder}/dicer`,
			encoder: `${cfg.binariesFolder}/langwitch_encode`,
			frequencyChecker: `${cfg.binariesFolder}/frqcheck_opt`,
			wordlist: `${cfg.binariesFolder}/wordlist`,
		},
		...implFileSystem,
	});
});

startSession.run({
	binariesFolder:
		`/Users/ckoshka/programming/rust-experiments/everything/target/release`,
	homeFolder: `preprocessing-scripts/temporary-sim`,
	languageName: Deno.args[0],
	dataFolder: `preprocessing-scripts/data`,
	known: []
}).then(() => Deno.exit());

// abstract out the parts specific to an implementation i.e web server vs console vs discord
// potentially collapse down into a single, typed record struct.
