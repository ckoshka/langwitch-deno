import { Input } from "https://deno.land/x/cliffy@v0.25.4/prompt/input.ts";
import { colors } from "../deps.ts";
import { implCommandOutput } from "../io_effects/mod.ts";
import { runMinimal } from "./read_minimal.ts";

const filename: string = await Input.prompt({
	message: "Choose a filename ending with .wordlist (just start typing and I'll provide suggestions)",
	suggestions: Array.from(Deno.readDirSync("langwitch-home/data")).map(f => f.name),
});

await implCommandOutput.runCmds([
    `cat langwitch-home/data/${filename.replace(".langwitch.wordlist", "")}`,
    `head -n 200000`,
    `minimal --wordlist langwitch-home/data/${filename} --per_word 15 --column 1 > sentences.txt`
]);

const outFile = "langwitch-home/data/" + filename.replace(".wordlist", ".examples");

console.log(`Okay, I'm preparing the data now. It will be called ${colors.bold(outFile)}`);

await runMinimal("sentences.txt", outFile);

console.log(`Done now, run this to open the interactive sentence looker-upper:
deno run -A --unstable https://raw.githubusercontent.com/ckoshka/langwitch-deno/master/plugins/dictionary-plugins/load.ts ${outFile}`);