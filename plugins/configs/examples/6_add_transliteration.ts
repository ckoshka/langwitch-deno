import transliterate from "https://esm.sh/@sindresorhus/transliterate@1.5.0";
import { Rem } from "../../deps.ts";

import { startLangwitch } from "../language.ts";

await startLangwitch({
	0: {
		conceptsFile: `langwitch-home/concepts/georgian.json`,
		sentencesFiles: [`georgian.tsv`],
		binariesFolder:
			`/Users/ckoshka/programming/rust-experiments/everything/target/release`,
	},
	1: (cfg) => {
		cfg.mapReferenceAnswer = transliterate;
        cfg.mapShownAnswer = transliterate;
        cfg.mapHint = Rem.map(transliterate);
	},
});
