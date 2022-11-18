import { join } from "https://deno.land/std@0.130.0/path/mod.ts";
import { CommandOutputEffect } from "../io_effects/mod.ts";
import { Free, NetEffect, use } from "./deps.ts";
import { getFile } from "./write.ts";

export const getArchive = () =>
	use<NetEffect<Promise<Response>>>().map2((fx) =>
		fx.fetch(
			`https://archive.org/metadata/english-portuguese-statmt`,
		)
	)
		.map((r) => r.json())
		.map((r) =>
			(r.files as { name: string }[]).map((x) => ({
				url: `https://archive.org/download/english-portuguese-statmt/${x.name}`,
				name: x.name,
				language: x.name.split("-")[1],
			}))
		);

const id = <T>(x: T) => x;
export const createFilter =
	(exclude: string[] = [], include: string[] = []) => (x: string) =>
		include.map((s) => x.includes(s)).every(id) &&
		exclude.map((s) => !x.includes(s)).every(id);

const fetchLanguage = (languageName: string) =>
	getArchive().map((xs) =>
		xs.filter((x) =>
			createFilter([`tatoeba_aggregated`, `5grams`, "bible"], [
				".tsv",
			])(
				x.name,
			) && x.language === languageName
		)
	);

export type CatEffect = {
	catBinaryPath: string;
};

export type QcEffect = {
	qcBinaryPath: string;
};

export type HeadEffect = {
	headBinaryPath: string;
};

export type DeduplicateEffect = {
	deduplicateBinaryPath: string;
};

export type SorterEffect = {
	sorterBinaryPath: string;
};

export type NoSameEffect = {
	nosameBinaryPath: string;
};

export const downloadLanguage = (languageName: string) =>
	use<
		& { homeFolder: string }
		& CatEffect
		& CommandOutputEffect
	> //& SorterEffect
	()
		//& NoSameEffect
		//& WcEffect
		//& HeadEffect

		.chain(() => fetchLanguage(languageName))
		.chain((xs, fx) =>
			Free.flatten(xs.map((x) =>
				getFile({
					name: x.name,
					outputFolder: join(fx.homeFolder, "data"),
					url: x.url,
				})
			))
		)
		.map(async (names, fx) => {
			try {
				await Deno.mkdir(fx.homeFolder);
			} catch {
				//
			}

			const finalName = join(fx.homeFolder, "data", languageName);
			await fx.runCmds([
				`paste -d "\\n" ${names.join(" ")}`,
				`grep . `,
				`head -n 3000000`,
				`${join(fx.homeFolder, "binaries", "dedup")}`,
				//`${fx.nosameBinaryPath}`,
				//`${fx.sorterBinaryPath} --min 0.97 --variety_filter false`,
				`split -l 1000000 - ${finalName}_`,
				//`lengthfilter --max_chars 260 --max_words 14 `
				// this should be expressed as part of the configuration
				// separate command
				// use openai -> typescript interface?
				// could leave the arguments delegate to the end

				// something like qc, but as a flow, or in smaller chunks
				// redundancy is important, well_formed isn't, neither is penalise_capitals

				// it would be easier to do the filtering after the fact, when contexts are being generated
				// but this might impact learnability of early words
				// and to add files in the background maybe?
				// as long as we keep the maximum quite large, there should be enough room to navigate.

				// let's create a server
			]);
		});

/*await fx.runCmds([
				`${fx.qcBinaryPath} --length_difference true --redundancy true --translated_partial true --well_formed true --penalise_capitals true --nonalphabetic true --k_top 0.25 < ${finalName} > ${finalName}_temp`,
			]);
			await fx.runCmds([
				`${fx.catBinaryPath} ${finalName}_temp > ${finalName}`,
			]);*/

// potentially apply the sorter filter, and nosame
