// ratios?
// shuf --random-source=<(yes 41)
// paste -d "\n"
// what's the problem?
// what's the desired final outcome?

import { hashObject } from "../deps.ts";

// desired outcome:
// * users can fetch sentences from a wide variety of different sources
// * the process of fetching and saving is platform independent
// * users can filter those sources
// * users can specify custom 'recipes' consisting of deterministic mixes of sources
// * those sources don't need to be rebuilt (a la Nix) if their output already exists
// * those sources can easily be deleted if need be
// * users don't have to manage sentences by copy-pasting, executing bash commands etc. themselves
// * .ctxs, .wordlist, .dict automatically rebuilt on change
// * we do all of this in a fast, memory-efficient, but rate-limit-respecting way with clear concurrency controls
// * instead of specifying a tsv, we specify a (potentially programmable) dynamic import that generates a tsv for us or points us to its location
// * a dynamic import alone should not have side effects, only evaluating its structure should
// * we can easily see a representative sample of their contents displayed, i.e randomly sampled first 1000 sentences?
// * datasets should have descriptions and metadata, static or dynamically generated
// * everything is cached - no redownloads
// * automatic post-processing of formats like tsv, or two files
// * fallibility?

// what's the dumbest most obvious way to do this?
// even simpler:
// - no cache or whatever, just take in files, shuffle them, split them into n chunks
// - cli: filename 4 filename2 2 filename 8
// - we're actually trying to accomplish several different things at once here.
// * a browser for datasets
// * a backend client for fetching them (done, partially)
// * a cli for managing and viewing them
// could have a .metadata.yaml file
// we could do this as a tui, but... it would make a lot more sense to do this using a deno-friendly full-stack framework

// - having a json object, (keys don't need to be sorted, neither does set ordering) then putting it through object-hash - flexible (accommodates different types), robust
// - something like topics_tennis-2-opus_eurozone-6, sorted - user-friendly, easy
// - could do both
// - programmatically (fluent / method-chaining) building up a descriptive structure
// - needs to be self-similar, i.e recursion is possible, a Source can be composed of several other sources, the parts have similar methods to the whole

export type Source = {
	url?: string;
	filename?: string;
	sources?: Source[];
	postprocessing?: ("csv" | "parquet" | "tmx" | "json" | "gzip" | "7z" | "zip" )[];
};

export type SourceMetadata = {
	year: number;
	order: 1 | 2 | 3;
	description: string;
	sample: [string, string][];
};

export type SourceModifier = {
	shuffle?: number;
	lines?: [number, number];
	fraction?: number;
};

export const SourceBuilder = (source: Source & SourceModifier) => {
	return {
		add: (s2: Source & SourceModifier) =>
			SourceBuilder({
				...source,
				sources: (source.sources || []).concat([s2]).sort((a, b) =>
					hashObject(a) > hashObject(b) ? -1 : 1
				),
			}),
		merge: (s2: Source & SourceModifier) =>
			SourceBuilder({
				sources: [source, s2].sort((a, b) =>
					hashObject(a) > hashObject(b) ? -1 : 1
				),
			}),
		get: () => source,
		hash: () => hashObject(source),
	};
};

const h1 = SourceBuilder({
	url: "https://www.hai hai hai hai",
	lines: [0, 10000],
})
	.merge({ filename: "local file.txt", fraction: 0.8 })
	.hash();

const h2 = SourceBuilder({ fraction: 0.8, filename: "local file.txt" })
	.merge({ url: "https://www.hai hai hai hai", lines: [0, 10000] })
	.hash();

// lower the requirements:

// you just need some function that can produce a unique hash of its outputs before actually performing any side effects (maybe based on arguments + namespace)

// LANGWITCH_HOME_FOLDER  env var?
// it doesn't need to be this complicated, we just need some kind of ratio thing, we download the files fully, and then once we have the line-count (can save as metadata, maybe pretty-printed line preview thing) we can do the ratios