import { Input } from "https://deno.land/x/cliffy@v0.25.4/prompt/input.ts";
import { colors } from "../deps.ts";
import { implCommandOutput } from "../io_effects/mod.ts";
import { runMinimal } from "./read_minimal.ts";
import { unZipFromURL } from 'https://deno.land/x/zip@v1.1.0/mod.ts'

await unZipFromURL(`https://github.com/ckoshka/minimal.rs/releases/download/v0.1.1/minimal.rs_v0.1.1_x86_64-apple-darwin.zip`, "minimal");
await implCommandOutput.runCmds([
    `mv minimal langwitch-home/binaries/minimal`
]);

const filename: string = await Input.prompt({
	message: "Choose a filename ending with .wordlist (just start typing and I'll provide suggestions)",
	suggestions: Array.from(Deno.readDirSync("langwitch-home/data")).map(f => f.name),
});

console.log("This could take a while...");

await implCommandOutput.runCmds([
    `cat langwitch-home/data/${filename.replace(".langwitch.wordlist", "")}`,
    `head -n 200000`,
    `langwitch-home/binaries/minimal --wordlist langwitch-home/data/${filename} --per_word 10 --column 1 | head -n 12000 > sentences.txt`
]);

const outFile = "langwitch-home/data/" + filename.replace(".wordlist", ".examples");

console.log(`Okay, I'm preparing the data now. It will be called ${colors.bold(outFile)}`);

await runMinimal("sentences.txt", outFile);
Deno.remove("sentences.txt");

console.log(`Done now, run this to open the interactive sentence looker-upper:
deno run -A --unstable https://raw.githubusercontent.com/ckoshka/langwitch-deno/master/plugins/dictionary-plugins/load.ts ${outFile}`);