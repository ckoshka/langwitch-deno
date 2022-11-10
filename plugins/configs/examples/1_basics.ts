// Here's a minimal config – nothing fancy, just the defaults + explanations.
// Each example in this folder gets gradually more complex

import { addCommands, startLangwitch } from "https://raw.githubusercontent.com/ckoshka/langwitch-deno/master/plugins/configs/language.ts"; 

// Langwitch v2 had to do a lot of work each time she started up.

// She had to:
// 1) load thousands of plain-text sentences into memory
// 2) detect and strip out irrelevant punctuation
// 3) tokenise those sentences into words
// 4) generate a topologically-ordered wordlist (the hardest part)
// V8 is quite fast, but for 3-5 million sentences, you're looking at a boot latency of over fifteen minutes followed by Deno crashing spectacularly.

// Langwitch v3 does this work once.

// When you give her a file called 'tagalog', she saves the results to three files:
// - tagalog.ctxs - this has all the processed sentences
// - tagalog.wordlist - this has the wordlist
// - tagalog.dict - this has a mapping between words and their hashes

// Once she detects these files exist, she won't recompute them. This means the Venetian deck with 450k sentences boots in around 0.7 seconds.
// So if you change 'tagalog' by removing or adding sentences, you need to make sure she registers the change by deleting these other generated files.

await startLangwitch({
	init: {
		// We want to read in our concepts from here:
		conceptsFile: `langwitch-home/concepts/venetian.json`,
		// And our sentences from these files
		sentencesFiles: [
			`langwitch-home/data/english-venetian-engmin-ord3-nllb-600m-2022.tsv`,
			`langwitch-home/data/english-venetian-minimal_sentences-ord3-nllb-600m-2022.tsv`,
			`langwitch-home/data/english-venetian-wikipedia_abbreviated-ord3-nllb-600m-2022.tsv`,
		],
		// And lastly, we tell LW where the binaries are for heavy-duty preprocessing
		binariesFolder:
			`/Users/ckoshka/programming/rust-experiments/everything/target/release`,
	},
	3: addCommands,
});
