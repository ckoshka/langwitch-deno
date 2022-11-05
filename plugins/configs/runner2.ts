import { createBackend, defaultConfig, Langwitch } from "./language2.ts";


const backend = await createBackend({
	conceptsFile: `langwitch-home/concepts/venetian.json`,
	sentencesFile: `langwitch-home/data/venetian`,
	binariesFolder:
		`/Users/ckoshka/programming/rust-experiments/everything/target/release`,
});

const config = defaultConfig.mapR("params", params => params.revise({maxLearnable: 3}));

Langwitch.run({
    ...config.contents,
    ...backend
})