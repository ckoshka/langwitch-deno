import { implAudio, implSpeak } from "https://raw.githubusercontent.com/ckoshka/langwitch-deno/master/plugins/configs/add_ons/extras/mod.ts";

import { startLangwitch } from "https://raw.githubusercontent.com/ckoshka/langwitch-deno/master/plugins/configs/language.ts";

// https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support?tabs=stt-tts

await startLangwitch({
	init: {
		conceptsFile: `langwitch-home/concepts/arabic.json`,
		sentencesFiles: [`arabic.tsv`],
		binariesFolder:
			`/Users/ckoshka/programming/rust-experiments/everything/target/release`,
	},
	1: cfg => cfg.extend(() => ({
        $tts: {
            pitch: "+0Hz" as const,
            rate: "-10%" as const,
            voice: "ar-KW-NouraNeural" as const,
            volume: "+0%" as const
        },
        ...implAudio({mpvPath: "mpv"})
    })),
    2: (cfg, fx) => cfg.extend(() => ({...implSpeak(fx)}))
});