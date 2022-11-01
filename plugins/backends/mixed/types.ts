import { LanguageMetadata } from "../../context-plugins/context-types/languages.ts";
import { int,Maybe,BaseContext } from "./deps.ts";


type Filename = string;
export type MixedBackendArgs = {
	sentences: Filename;
	desiredWords: string[];
	knownWords: string[];
	maximumWordsToQueue: number;
	toContext: (
		i: int,
		s: string,
	) => Maybe<BaseContext & { metadata: LanguageMetadata }>;
	filterCtxs: (ctxs: [string, string][]) => [string, string][];
};
