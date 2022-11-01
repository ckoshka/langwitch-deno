// cargo build the necessary packages
// install git
// install mpv
// install deno
// no, just use nix, none of these need to be installed except deno
// sync the git repo plugins thing

import $ from "https://deno.land/x/dax@0.9.0/mod.ts";

const buildRustBinaries = async () => {
	$.logLight(`Cloning directory...`);
	await $`git clone --depth 1 https://github.com/ckoshka/everything`;
	const rm = (folder: string) => Deno.remove(`everything/programs/${folder}`, {recursive: true});
	await Promise.all(
	[`ai_stuff`, `archived`, `experimental`, `fun`, `useful`, `wasm_libs`].map(
		rm,
	),
	);
	$.logLight(`Done cloning and cleaning directory...`);

	$.logLight(`Building targets...`);
	await $`cd everything`.exportEnv();
	await $`cargo build --release --workspace`;
	await $`cd ..`.exportEnv();
	$.logLight(`Done building targets...`);

	await $`mkdir binaries`;
	await $`mkdir .langwitch`;
	await $`mv everything/target/release .`;
	await $`mv release binaries`;
	await $`mv binaries .langwitch`;
	Deno.remove(`everything`, {recursive: true});
	$.logLight(`Done!`);
}

const addLangwitch = async () => {
	await Deno.writeTextFile(`lw`, `#!/bin/bash
URL="/Users/ckoshka/programming/langwitch/langwitch-deno/plugins/configs/runner.ts"
deno run -A --unstable $URL $1 $2`);
	await $`chmod +x lw`;
}

await buildRustBinaries();
await addLangwitch();
console.log("You're ready! Run this:\nlw fetch {language}\nThen this:\nlw learn {language}");