import { BaseContext, int, Maybe, Scoped } from "./deps.ts";

type Filename = string;
export type MixedBackendArgs = {
	sentencesFile: Filename;
	desiredWords: string[];
	knownWords: string[];
	maximumWordsToQueue: number;
	filterCtxs: (ctxs: [string, string][]) => [string, string][];
};

export type InitialiseMixedBackendArgs = Scoped<
	"$backend",
	{
		wordlistMaximumIterSteps: number;
		eachWordCallback: (s: string) => void;
	} & MixedBackendArgs
>;
