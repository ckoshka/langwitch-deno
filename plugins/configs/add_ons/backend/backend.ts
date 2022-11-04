import { initialiseMixedBackend } from "../../../backends/mixed/mod.ts";
import { implFileSystem } from "../../../io_effects/mod.ts";

type Filename = string;
type Word = string;
type LeftColumn = string;
type RightColumn = string;
export type BackendArgs = {
	sentencesFile: Filename;
	filterCtxs: (
		ctxs: [LeftColumn, RightColumn][],
	) => [LeftColumn, RightColumn][];
	knownWords: Word[];
	binariesFolder: Filename;
};

// TODO: This needs to be changed to take dynamic imports as an argument

/*

const { sentencesFile, filterCtxs, knownWords, binariesFolder } =
	await awaitRecord({
		sentencesFile: fromEnv("sentencesFile"),
		filterCtxs: importDefault<BackendArgs["filterCtxs"]>(fromEnv("filterCtxs")),
		knownWords: loader.loadConcepts().then(Object.keys),
		binariesFolder: fromEnv("sentencesFile"),
	});

*/

export default (
	{ sentencesFile, filterCtxs, knownWords, binariesFolder }: BackendArgs,
) => initialiseMixedBackend.run({
	backend: {
		sentencesFile,
		desiredWords: [],
		maximumWordsToQueue: 25,
		wordlistMaximumIterSteps: 15,
		knownWords,
		filterCtxs,
		eachWordCallback: (c) => console.log(c),
	},
	bins: {
		dicer: `${binariesFolder}/dicer`,
		encoder: `${binariesFolder}/langwitch_encode`,
		frequencyChecker: `${binariesFolder}/frqcheck_opt`,
		wordlist: `${binariesFolder}/wordlist`,
	},
	...implFileSystem,
});