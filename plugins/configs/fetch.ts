import { downloadLanguage } from "../downloader-plugins/mod.ts";
import { implCommandOutput } from "../io_effects/mod.ts";

const makeSentences = (language: string) =>
	downloadLanguage(language)
		.run({
			catBinaryPath: `cat`,
			curlBinaryPath: `curl`,
			deduplicateBinaryPath: `langwitch-home/binaries/dedup`,
			fetch,
			...implCommandOutput,
			homeFolder: `langwitch-home`,
		});