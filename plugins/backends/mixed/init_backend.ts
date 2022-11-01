import { LanguageMetadata } from "../../context-plugins/context-types/mod.ts";
import {
	BinaryFileReader,
	CommandOutputEffect,
	FileExistsEffect,
	RemoveFileEffect,
	TempFileEffect,
	WriteTextFileEffect,
} from "../../io_effects/effects.ts";
import { initJsQuerier } from "../pure_typescript/impl_next_contexts.ts";
import {
	AsyncGen,
	BaseContext,
	fast1a32,
	int,
	Maybe,
	ReadFileEffect,
	Rem,
	use,
} from "./deps.ts";
import { MixedBackendArgs } from "./types.ts";

export const makeFilenames = (filename: string) => {
	const encodings = `${filename}.langwitch.ctxs`;
	const dict = `${filename}.langwitch.dict`;
	const wordlist = `${filename}.langwitch.wordlist`;
	return { encodings, dict, wordlist };
};

export const preprocessTsv = (args: MixedBackendArgs) =>
	use<BinaryFileReader & FileExistsEffect & CommandOutputEffect>()
		.map2(async (fx) => {
			const { encodings, dict } = makeFilenames(args.sentences);

			await fx.fileExists(encodings).then(async (exists) =>
				!exists
					? await fx.runCmds([
						`cat ${args.sentences}`,
						`${fx.bins.dicer} --order [1]`,
						`${fx.bins.encoder} --encodings_filename ${encodings} --dictionary_filename ${dict}`,
					])
					: {}
			);

			return args;
		});

export const createMixedBackend = (args: MixedBackendArgs) =>
	use<
		& BinaryFileReader
		& RemoveFileEffect
		& TempFileEffect
		& CommandOutputEffect
	>().map2(
		async (fx) => {
			const { encodings } = makeFilenames(args.sentences);

			//console.log(args.desiredWords);

			const [desiredWords, knownWords] = await Promise.all([
				fx.createTempFile(
					args.desiredWords.slice(0, args.maximumWordsToQueue).concat(args.knownWords.slice(Math.round(args.knownWords.length / 10) * 9)).join("\n"),
					// this makes it slower
				),
				fx.createTempFile(args.knownWords.join("\n")),
			]);

			const lines = await Rem.pipe(
				fx.getIterFromCmds([
					`${fx.bins.frequencyChecker} --desired_words_file ${desiredWords} --known_words_file ${knownWords} --sentences_file ${args.sentences} --ctxs_file ${encodings}`,
				]),
				AsyncGen.toArray,
			);

			const pairs = lines.filter((x) => x.includes("\t")).map((line) =>
				line.split("\t") as [string, string]
			);

			let counter = 0;

			//const filteredCtxs = args.filterCtxs(pairs);

			const ctxs = await Rem.pipe(
				pairs,
				AsyncGen.fromIter,
				// so the filtering step should happen here
				AsyncGen.map((line) => {
					return args.toContext(fast1a32(line[1]) as int, line.join("\t"));
				}),
				AsyncGen.filter((ctx) => ctx.isSome()),
				AsyncGen.map((ctx) => {
					counter += 1;
					return ctx.get();
				}),
				AsyncGen.toArray,
			);
			// the id numbers are misaligned now.
			fx.removeFile(desiredWords);
			fx.removeFile(knownWords);

			const reverseMap = new Map(ctxs.map((c) => [c.id, c]));

			const result = {
				...(await initJsQuerier().run({
					ctxs,
				})),
				getMetadata: (id: int) => reverseMap.get(id)!.metadata,
			};

			return result;
		},
	);

// TODO: add deduplicate, then check capitals?

export const makeWordlist = (
	args: MixedBackendArgs,
	maxIters: number,
	cb: (s: string) => void,
) => use<
	& BinaryFileReader
	& FileExistsEffect
	& CommandOutputEffect
	& WriteTextFileEffect
	& ReadFileEffect<Promise<string>>
>().chain(
	() => preprocessTsv(args),
).map2(async (fx) => {
	const knownWords = new Set(args.knownWords);
	const { encodings, dict, wordlist } = makeFilenames(args.sentences);
	const words: string[] = [];
	if (await fx.fileExists(wordlist)) {
		await fx.readFile(wordlist).then((x) => x.split("\n")).then((xs) =>
			words.push(...xs)
		);
	} else {
		await Rem.pipe(
			fx.getIterFromCmds([
				`${fx.bins.wordlist} --ctxs_msgpack ${encodings} --dict_msgpack ${dict} --existing "${Array.from(knownWords).join(" ")}"`,
			]),
			AsyncGen.map((w) => w.split(" ")),
			AsyncGen.take(maxIters),
			AsyncGen.map((word) => {
				words.push(...word.filter((w: string) => w.length > 0));
				word.forEach(cb);
			}),
			AsyncGen.toArray,
		);

		await fx.writeTextFile(
			wordlist,
			words.join("\n"),
		);
	}

	return {
		...args,
		desiredWords: words.filter(k => !knownWords.has(k))
	};
});

export type InitialiseMixedBackendArgs = {
	wordlistMaximumIterSteps: number;
	eachWordCallback: (s: string) => void;
} & MixedBackendArgs;

export const initialiseMixedBackend = (args: InitialiseMixedBackendArgs) => makeWordlist(args, args.wordlistMaximumIterSteps, args.eachWordCallback).chain(createMixedBackend);
