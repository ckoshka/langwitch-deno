import $ from "https://deno.land/x/dax@0.9.0/mod.ts";

const buildRustBinaries = async () => {
	$.logLight(`Cloning directory...`);
	await $`git clone --depth 1 https://github.com/ckoshka/everything`;
	const rm = (folder: string) =>
		Deno.remove(`everything/programs/${folder}`, { recursive: true });
	await Promise.all(
		[`ai_stuff`, `archived`, `experimental`, `fun`, `useful`, `wasm_libs`]
			.map(
				rm,
			),
	);
	$.logLight(`Done cloning and cleaning directory...`);

	$.logLight(`Building targets...`);
	await $`cd everything`.exportEnv();
	await $`cargo build --release --workspace`;
	await $`cd ..`.exportEnv();
	$.logLight(`Done building targets...`);

	await $`mkdir concepts`;
	await $`mkdir data`;
	await $`mv everything/target/release .`;
	await $`mv release binaries`;
	Deno.remove(`everything`, { recursive: true });
	$.logLight(`Done!`);
};

const addLangwitch = async () => {
	
};

await buildRustBinaries();
await addLangwitch();
