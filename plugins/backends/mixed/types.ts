import { BaseContext, int, Maybe } from "./deps.ts";

type Filename = string;
export type MixedBackendArgs = {
	sentencesFile: Filename;
	desiredWords: string[];
	knownWords: string[];
	maximumWordsToQueue: number;
	filterCtxs: (ctxs: [string, string][]) => [string, string][];
};

export type InitialiseMixedBackendArgs = {
	backend: {
		wordlistMaximumIterSteps: number;
		eachWordCallback: (s: string) => void;
	} & MixedBackendArgs;
};
