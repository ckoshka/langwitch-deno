// so we ask the user what concepts file to use, and what sentences file thing to use.

// installing a language should be separate, not implicit and automatic

/**
 * 
 * await downloadLanguage(cfg.languageName)
				.run({
					catBinaryPath: `cat`,
					fetch: fetch,
					...implFileSystem,
					homeFolder: cfg.homeFolder,
					deduplicateBinaryPath: `${cfg.binariesFolder}/deduplicate`,
					curlBinaryPath: "curl",
				});
 */

//import { Input, Select } from "https://deno.land/x/cliffy@v0.25.4/prompt/mod.ts";
import { downloadLanguage } from "../downloader-plugins/mod.ts";
import { implCommandOutput } from "../io_effects/mod.ts";
import Session from "./language.ts";

const makeSession = (language: string) => Session().run({
	binariesFolder: `langwitch-home/binaries`,
	conceptsFile: `langwitch-home/concepts/${language}.json`,
	sentencesFile: `langwitch-home/data/${language}`
});

const makeSentences = (language: string) => downloadLanguage(language)
	.run({
		catBinaryPath: `cat`,
		curlBinaryPath: `curl`,
		deduplicateBinaryPath: `langwitch-home/binaries/dedup`,
		fetch,
		...implCommandOutput,
		homeFolder: `langwitch-home`
	});
// todo: accept --sentences and --concepts
const subcommand = Deno.args[0];
const language = Deno.args[1];
// note to self: filtering contexts makes langwitch fail unexpectedly
// might be acceptable to do this prior to downloading?
switch(subcommand) {
	case "fetch": {
		await makeSentences(language).then(() => Deno.exit());
		break
	}
	case "learn": {
		await makeSession(language).catch(() => {console.log("Session over!"); Deno.exit()});
		break
	}
	case "auto": {
		for await (const file of Deno.readDir("langwitch-home/concepts")) {
			await makeSession(file.name.replace(".json", "")).catch(() => console.log("Next up..."));
		}
	}
}

// TODO: Auto mode

// having a canonical directory structure makes plugins easier
// the more standardised things are, the easier plugins are

// what do you want to do?
// - add a language
// - learn an existing language

// lw command?
// lw learn
// lw add
// lw stats ?

// we need a dotenv file i think
// or some default metaconfig.json

// specify sentencesFile and conceptsFile in terms of the root directory