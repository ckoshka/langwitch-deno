// so we get the wordlist from wordlist, it doesn't need to be especially fast because we can just run it in the background after grabbing the first couple, or it could be predone
// then after making the two files (dict and ctxs) using langwitch_encode
// we input them and the original file into langwitch_query
// let's spawn three threads
// then it's just writing {focus_word}|||{other}||{words}||{go_here}
// we need that thing that turns bash into async generator
import { LanguageMetadata } from "../../context-plugins/implementors/language/metadata_types.ts";
import { languageConfig } from "../../context-plugins/implementors/language/preproc.ts";
import { tokenize } from "../../preprocessing/mod.ts";
import { processLine } from "../../preprocessing/readers/delimited_text.ts";
import {
	BaseContext,
	ConceptQueryEffect,
	ContextQueryEffect,
	Free,
	int,
	Maybe,
	Rem,
	rpc,
	run,
} from "./deps.ts";

type Filename = string;
type BinaryFile = string;
export type RustBackendInputs<T> = {
	sentences: Filename;
	encode: BinaryFile;
	query: BinaryFile;
	wordlist: BinaryFile;
	dicer: BinaryFile;
	toContext: (
		i: int,
		s: string,
	) => Maybe<() => BaseContext & { metadata: T }>;
};

const exists = (filename: string) =>
	Deno.stat(filename).then(() => true).catch(() => false);

export const RustBackend = async <T extends LanguageMetadata>(
	inps: RustBackendInputs<T>,
) => {
	const dictFilename = `${inps.sentences}.dict`;
	const encodingsFilename = `${inps.sentences}.ctxs`;

	if (!(await exists(dictFilename) && await exists(encodingsFilename))) {
		await run(`cat ${inps.sentences}`)
			.run(`${inps.dicer} --order [1]`)
			.run(
				`${inps.encode} --dictionary_filename ${dictFilename} --encodings_filename ${encodingsFilename}`,
			)
			.success();
	}

	const words: string[] = [];
	(async function () {
		for await (
			const word of run(
				`${inps.wordlist} -c ${encodingsFilename} -d ${dictFilename}`,
				{ stderr: "null" },
			)
				//.head(40)
				.toIterable()
		) {
			words.push(...word.split(" "));
			// TODO: Write this to a precomputed list.
		}
	})();

	const server = await rpc(
		`${inps.query} -c ${encodingsFilename} -d ${dictFilename} -s ${inps.sentences} --sync_mode`,
	);

	const metas: Map<int, BaseContext & { metadata: T }> = new Map();

	const getMetadata = (i: int) => metas.get(i)!.metadata;

	await new Promise((resolve) => setTimeout(resolve, 13000));

	return <ContextQueryEffect & ConceptQueryEffect & {
		getMetadata: (id: int) => T;
	}> {
		nextConcepts: Free.reader(({ knowns, total }) => {
			const kn = new Set(knowns);
			const results = Rem.pipe(
				words,
				Rem.filter((w: string) => w.length > 0),
				Rem.filter((w) => !kn.has(w)),
				Rem.take(total),
				(w) => new Set(w),
			);
			//console.log(results);
			return results;
		}),
		nextContexts: Free.reader(async ({ knowns, focus }) => {
			const results: (BaseContext & {
				metadata: T;
			})[] = [];
			const knownsArray = Array.from(knowns);
			const knownsSet = new Set(knownsArray);
			const knownsStr = knownsArray.join("||");
			const focusSet = new Set(focus);
			console.log({ knowns, focus });
			for (const foc of focus) {
				// problem appears to be that we're getting irrelevant lines, almost as if
				// the line numbers were out of order again
				// but that isn't the case.
				await server.ask(`${foc}|||${knownsStr}`).then(
					(r) => {
						return r.split("\n").filter((c) => c.length > 0).map(
							(c) => {
								const [n, ctx] = c.split("|", 2);
								const i = Number(n) as int;
								const asCtx = inps.toContext(i, ctx);
								if (asCtx.isSome()) {
									const newCtx = asCtx.get()();
									const onlyKnowns =
										newCtx.concepts.filter((x) =>
											!(knownsSet.has(x) ||
												focusSet.has(x))
										).length < 2;
									if (onlyKnowns) {
										metas.set(i, newCtx);
										return Maybe.some(newCtx);
									}
								}
								// if the metadata words don't fit the criteria, then return Nothing
								return Maybe.none();
							},
						).filter((c) => c.isSome()).map((c) => c.get());
					},
				).then((px) => results.push(...px));
			}
			return results;
		}),
		getMetadata,
	};
};

/*const backend = await RustBackend<LanguageMetadata>({
    sentences: `/Users/ckoshka/programming/rust-experiments/langwitch_scripts/augment/minified_shuffled/catalan`,
    dicer: `/Users/ckoshka/programming/bash_experiments/showcase/target/release/dicer`,
    encode: `/Users/ckoshka/programming/bash_experiments/showcase/target/release/langwitch_encode`,
    query: `/Users/ckoshka/programming/bash_experiments/showcase/target/release/langwitch_query`,
    toContext: await languageConfig.map(c => processLine<string, LanguageMetadata>(c)).run({
        tokenize: tokenize({granularity: "word", filterIsWordLike: true})
    }),
    wordlist: `/Users/ckoshka/programming/bash_experiments/showcase/target/release/wordlist`
});

await Deno.readTextFile(`/Users/ckoshka/programming/bash_experiments/showcase/curr/build/tools/langwitch_query/catalan_frq.txt`)
    .then(t => backend.nextContexts.run({knowns: t.split("||"), focus: "un"}))
    .then(x => {
        console.log(x);
    })*/
