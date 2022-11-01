import { LanguageMetadata } from "../../context-plugins/context-types/languages.ts";
import { BaseContext, int, Maybe } from "./deps.ts";

type Filename = string;
export type MixedBackendArgs = {
	sentencesFile: Filename;
	desiredWords: string[];
	knownWords: string[];
	maximumWordsToQueue: number;
	toContext: (
		i: int,
		s: string,
	) => Maybe<BaseContext & { metadata: LanguageMetadata }>;
	filterCtxs: (ctxs: [string, string][]) => [string, string][];
};

export type InitialiseMixedBackendArgs = {
	backend: {
		wordlistMaximumIterSteps: number;
		eachWordCallback: (s: string) => void;
	} & MixedBackendArgs;
};
