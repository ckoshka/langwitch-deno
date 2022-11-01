import {
	ColumnarConfig,
	Revisable,
	revisable,
	TokenizeEffect,
	use,
} from "../../deps.ts";

export type ScriptFieldNames = "originalWord" | "transliteratedWord";

export type ScriptMetadata = {
	graphemes: string[];
	originalWord: string;
	transliteratedWord: string;
};

export const defaultConfig = use<TokenizeEffect>().map2((fx) =>
	revisable({
		separator: "\t",
		postprocessors: {
			transliteratedWord: (s) => s.normalize(),
			originalWord: (s) => s.normalize(),
		},
		mappings: {
			originalWord: 0,
			transliteratedWord: 1,
		},
		backupMappings: {},
		defaultMappings: {},
		toConcepts: (m) => fx.tokenize(m.get("originalWord")!),
		toMeta: (rec) => ({
			graphemes: fx.tokenize(rec.get("originalWord")!),
			originalWord: rec.get("originalWord")!,
			transliteratedWord: rec.get("transliteratedWord")!,
		}),
		isValidFastCheck: (s) => s.split("\t").at(1) != "",
	}) as Revisable<ColumnarConfig<ScriptFieldNames, ScriptMetadata>>
);
