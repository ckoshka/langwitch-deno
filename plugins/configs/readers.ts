import {
	ensureDir,
	FileExistsEffect,
	implFileSystem,
	ReadTextFileEffect,
} from "../io_effects/mod.ts";
import { Concept, ensure, makeRecord, use } from "../deps.ts";
import { DefaultConfigReader } from "./config_reader.ts";
import { downloadLanguage } from "../downloader-plugins/mod.ts";

export const readConcepts = () =>
	use<ReadTextFileEffect & DefaultConfigReader>().map2(async (fx) => {
		let concepts: Concept[] = await ensure({
			try: () => fx.readTextFile(fx.conceptsFile).then(JSON.parse),
			catch: async () => {
				return [];
			},
		});
		concepts = concepts.filter((c) => c.timesSeen > 3);
		return makeRecord((c: Concept) => c.name)(concepts);
	});

export const ensureSentences = () =>
	use<DefaultConfigReader & FileExistsEffect>().map2(async (cfg) => {
		const exists = await cfg.fileExists(cfg.sentencesFile);
		if (!exists) throw new Error("Sentences not found");
		return cfg.sentencesFile;
	});
