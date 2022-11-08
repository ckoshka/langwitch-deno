import transliterate from "https://esm.sh/@sindresorhus/transliterate@1.5.0";
import { Rem } from "../../deps.ts";

import { startLangwitch } from "../language.ts";

await startLangwitch({
	init: {
		conceptsFile: `langwitch-home/concepts/georgian.json`,
		sentencesFiles: [`georgian.tsv`],
		binariesFolder:
			`/Users/ckoshka/programming/rust-experiments/everything/target/release`,
	},
	1: cfg => cfg.revise({
        mapReferenceAnswer: transliterate,
        mapShownAnswer: transliterate,
        mapHint: Rem.map(transliterate)
        // this is pretty repetitive but it allows us to granularly tweak settings if we want these to be different, i.e romanisation systems
    }),
});
