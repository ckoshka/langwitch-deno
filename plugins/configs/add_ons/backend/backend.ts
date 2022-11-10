import { initialiseMixedBackend } from "../../../backends/mixed/mod.ts";
import { mergeMultipleBackends } from "../../../backends/pure_typescript/impl_next_contexts.ts";
import { join } from "../../../deps.ts";
import { implFileSystem } from "../../../io_effects/mod.ts";

type Filename = string;
type Word = string;
type LeftColumn = string;
type RightColumn = string;
export type BackendArgs = {
	sentencesFiles: Filename[];
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
	{ sentencesFiles, filterCtxs, knownWords, binariesFolder }: BackendArgs,
) => Promise.all(sentencesFiles.map((file) =>
	initialiseMixedBackend.run({
		$backend: {
			sentencesFile: file,
			desiredWords: [],
			maximumWordsToQueue: 25,
			wordlistMaximumIterSteps: 15,
			knownWords,
			filterCtxs,
			eachWordCallback: (c) => console.log(c),
		},
		bins: {
			dicer: join(binariesFolder, "dicer"),
			encoder: join(binariesFolder, "langwitch_encode"),
			frequencyChecker: join(binariesFolder, "frqcheck_opt"),
			wordlist: join(binariesFolder, "wordlist"),
		},
		...implFileSystem,
	})
)).then(mergeMultipleBackends);
