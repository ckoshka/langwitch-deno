import {
	BinaryFileReader,
	CommandOutputEffect,
	FileExistsEffect,
	RemoveFileEffect,
	TempFileEffect,
	WriteTextFileEffect
} from "../../io_effects/effects.ts";
import { languageConfig } from "../../preprocessing/language/preproc.ts";
import { processLine, tokenize } from "../../preprocessing/mod.ts";
import { LanguageMetadata } from "../../state-transformers/mod.ts";
import { initJsQuerier } from "../pure_typescript/impl_next_contexts.ts";
import {
	AsyncGen, fast1a32,
	int, ReadFileEffect,
	Rem,
	use
} from "./deps.ts";
import { InitialiseMixedBackendArgs } from "./types.ts";

export const makeFilenames = (filename: string) => {
	const encodings = `${filename}.langwitch.ctxs`;
	const dict = `${filename}.langwitch.dict`;
	const wordlist = `${filename}.langwitch.wordlist`;
	return { encodings, dict, wordlist };
};

export const preprocessTsv = () =>
	use<
		& InitialiseMixedBackendArgs
		& BinaryFileReader
		& FileExistsEffect
		& CommandOutputEffect
	>()
		.map2(async (fx) => {
			const { encodings, dict } = makeFilenames(fx.backend.sentencesFile);

			await fx.fileExists(encodings).then(async (exists) =>
				!exists
					? await fx.runCmds([
						`cat ${fx.backend.sentencesFile}`,
						`${fx.bins.dicer} --order [1]`,
						`${fx.bins.encoder} --encodings_filename ${encodings} --dictionary_filename ${dict}`,
					])
					: {}
			);
		});

const toContext = await languageConfig.map((c) =>
	processLine<string, LanguageMetadata>(c.contents as any)
).run({
	tokenize: tokenize({
		granularity: "word",
		filterIsWordLike: true,
	}),
});

export const createMixedBackend = (desiredWords: string[]) =>
	use<
		& InitialiseMixedBackendArgs
		& BinaryFileReader
		& RemoveFileEffect
		& TempFileEffect
		& CommandOutputEffect
	>().map2(
		async (fx) => {
			const { encodings } = makeFilenames(fx.backend.sentencesFile);

			//console.log(args.desiredWords);

			const [desiredWordsFile, knownWordsFile] = await Promise.all([
				fx.createTempFile(
					desiredWords.slice(0, fx.backend.maximumWordsToQueue)
						.concat(
							fx.backend.knownWords.slice(
								Math.round(fx.backend.knownWords.length / 10) *
									9,
							),
						).join("\n"),
					// this makes it slower
				),
				fx.createTempFile(fx.backend.knownWords.join("\n")),
			]);

			const lines = await Rem.pipe(
				fx.getIterFromCmds([
					`${fx.bins.frequencyChecker} --desired_words_file ${desiredWordsFile} --known_words_file ${knownWordsFile} --sentences_file ${fx.backend.sentencesFile} --ctxs_file ${encodings}`,
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
					return toContext(
						fast1a32(line[1]) as int,
						line.join("\t"),
					);
				}),
				AsyncGen.filter((ctx) => ctx.isSome()),
				AsyncGen.map((ctx) => {
					counter += 1;
					return ctx.get();
				}),
				AsyncGen.toArray,
			);
			// the id numbers are misaligned now.
			fx.removeFile(desiredWordsFile);
			fx.removeFile(knownWordsFile);

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

export const makeWordlist = use<
	& InitialiseMixedBackendArgs
	& BinaryFileReader
	& FileExistsEffect
	& CommandOutputEffect
	& WriteTextFileEffect
	& ReadFileEffect<Promise<string>>
>().chain(preprocessTsv).map2(async (fx) => {
	const knownWords = new Set(fx.backend.knownWords);
	const { encodings, dict, wordlist } = makeFilenames(
		fx.backend.sentencesFile,
	);
	const words: string[] = [];
	if (await fx.fileExists(wordlist)) {
		await fx.readFile(wordlist).then((x) => x.split("\n")).then((xs) =>
			words.push(...xs)
		);
	} else {
		await Rem.pipe(
			fx.getIterFromCmds([
				`${fx.bins.wordlist} --ctxs_msgpack ${encodings} --dict_msgpack ${dict} --existing "${
					Array.from(knownWords).join(" ")
				}"`,
			]),
			AsyncGen.map((w) => w.split(" ")),
			AsyncGen.take(fx.backend.wordlistMaximumIterSteps),
			AsyncGen.map((word) => {
				words.push(...word.filter((w: string) => w.length > 0));
				word.forEach(fx.backend.eachWordCallback);
			}),
			AsyncGen.toArray,
		);

		await fx.writeTextFile(
			wordlist,
			words.join("\n"),
		);
	}

	return words.filter((k) => !knownWords.has(k));
});

export const initialiseMixedBackend = makeWordlist.chain(createMixedBackend);
