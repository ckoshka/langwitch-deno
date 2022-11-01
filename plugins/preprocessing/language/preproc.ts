import {
	LanguageFieldNames,
	LanguageMetadata,
} from "../../context-plugins/context-types/mod.ts";
import { Revisable, revisable, use } from "../deps.ts";
import { ColumnarConfig, TokenizeEffect } from "../mod.ts";

export const languageConfig = use<TokenizeEffect>().map2((fx) =>
	revisable({
		separator: "\t",
		postprocessors: {
			back: (s) => s.toLowerCase(),
		},
		mappings: {
			front: 0,
			back: 1,
			tts: 2,
		},
		backupMappings: {
			tts: 1,
		},
		defaultMappings: {},
		toConcepts: (m) => fx.tokenize(m.get("back")!),
		toMeta: (rec) => ({
			words: fx.tokenize(rec.get("back")!),
			back: rec.get("back")!,
			front: rec.get("front")!,
			tts: rec.get("tts")!,
		}),
		isValidFastCheck: (s) => s.split("\t").at(1) != "",
	}) as Revisable<ColumnarConfig<LanguageFieldNames, LanguageMetadata>>
);
