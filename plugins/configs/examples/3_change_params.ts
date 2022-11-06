import { startLangwitch } from "../language.ts";

await startLangwitch({
	0: {
		conceptsFile: `langwitch-home/concepts/venetian.json`,
		sentencesFiles: [`langwitch-home/data/venetian`],
		binariesFolder:
			`/Users/ckoshka/programming/rust-experiments/everything/target/release`,
	},
	1: (cfg) => {
		cfg.params.maxLearnable = 3;
	},
});
