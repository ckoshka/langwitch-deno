import { initialiseMixedBackend } from "../backends/mixed/init_backend.ts";
import { BaseContext, int, Maybe } from "../deps.ts";
import { implFileSystem } from "../io_effects/impls.ts";

type Filename = string;
type Word = string;
type LeftColumn = string;
type RightColumn = string;
type Line = string;
type LineId = int;
export type BackendArgs = {
	sentencesFile: Filename;
	toContext: (i: LineId, s: Line) => Maybe<BaseContext>;
	filterCtxs: (
		ctxs: [LeftColumn, RightColumn][],
	) => [LeftColumn, RightColumn][];
	knownWords: Word[];
	binariesFolder: Filename;
};

const backend = (
	{ sentencesFile, toContext, filterCtxs, knownWords, binariesFolder }:
		BackendArgs,
) => initialiseMixedBackend.run({
	backend: {
		sentencesFile,
		desiredWords: [],
		maximumWordsToQueue: 25,
		wordlistMaximumIterSteps: 15,
		knownWords,
		toContext,
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
