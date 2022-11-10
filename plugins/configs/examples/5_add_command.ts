// give example with usage of the .map - do we really need it though?

import { Message, revisable, State } from "https://raw.githubusercontent.com/ckoshka/langwitch-deno/master/plugins/deps.ts";
import { ToMark } from "https://raw.githubusercontent.com/ckoshka/langwitch-deno/master/plugins/state-transformers/mod.ts";
import { startLangwitch } from "https://raw.githubusercontent.com/ckoshka/langwitch-deno/master/plugins/configs/language.ts";

// This is how you'd make a new command. I'll add explanations for the weirder parts of Typescript's syntax in case you're not sure.
// A command is just a function that runs before or after a particular phase, like "marking" or "quizzing".

// It accepts a Message, which has a couple of interesting things in it. We'll call it 'm'

// - m.data - this will either have a m.data.userAnswer or a m.data.results (a series of scores)
// - m.state - this describes the entire state of lw internally; it has details about what's known, what's still being learned, how many times a concept has been seen, and so on.
// - m.next - this says which phase should come next
// - m.map - this is an immutable map used to help extensions talk to each other

// This command will just fetch stuff from Wiktionary
export const fetchWiktionary = (language: string) =>
    // this function is curried, so we call it like this: 
    // const frenchFetcher = fetchWiktionary("french");
    // frenchFetcher("bonjour")
    // or more concisely: fetchWiktionary("french")("bonjour")
	(word: string) =>
		fetch(
			`https://kaikki.org/dictionary/${language}/meaning/${word[0]}/${
				word.slice(0, 2)
			}/${word}.json`,
		)
            // the ${} stuff is string interpolation, and we're just taking advantage of the indexer
			.then((r) => r.text())
            // this is needed to convert the response into text
			.then((r) => r.split("\n").filter(l => l.length > 0).map((line) => JSON.parse(line)))
            // the text response is actually jsonl not json so we need to split it
            .catch((e) => [e])
            // any errors usually mean the word can't be found

const Wiktionary = (language: string) => (keyBinding = "!w") =>
	async (
		m: Message<ToMark, State>,
	) => {
		if (m.data?.userAnswer?.toLowerCase().trim().startsWith(keyBinding)) {
			// the question marks mean "I have no idea if this property is really there or not, so if it isn't, just short-circuit early and don't bother going any deeper"
            const wordDesired = m.data.userAnswer.split(" ")[1];
            // get what word they want
            console.log("Fetching...");
            const result = await fetchWiktionary(language)(wordDesired);
            result.forEach(r => console.log(r));
            // fetch it and show each of the results
            prompt("Press enter if you're done reading");
            // this is needed otherwise the next phase will clear the screen and the user won't be able to see it

            return revisable(m)
                // this allows us to immutably modify the original message
                .revise({ next: "quiz" })
                // we change 'next' to quiz, looping us back instead of actually marking the command as an answer
                .extend(() => ({ data: null }))
                // since 'data' is null and not the original type, we need to use the extend method to say to the revisable "hey, I promise I'm not making a mistake, I really want this property to be null"
                .contents;
                // and lastly, we turn it back into a plain object
		}
		return m;
	};

await startLangwitch({
	init: {
		conceptsFile: `langwitch-home/concepts/venetian.json`,
		sentencesFiles: [
			`langwitch-home/data/english-venetian-engmin-ord3-nllb-600m-2022.tsv`,
			`langwitch-home/data/english-venetian-minimal_sentences-ord3-nllb-600m-2022.tsv`,
			`langwitch-home/data/english-venetian-wikipedia_abbreviated-ord3-nllb-600m-2022.tsv`,
		],
		binariesFolder:
			`/Users/ckoshka/programming/rust-experiments/everything/target/release`,
	},
	3: m => m.append("quiz", Wiktionary("Venetian")("!w")),
});
