import { alignerClient, preAlignmentFilter } from "./deps.ts";

const getIdx = (idx: number) => <T>(arr: T[]) => arr[idx];

const windows = (size: number) => <T>(arr: T[]) =>
	Array.from({ length: arr.length }).map((_, i) => arr.slice(i, i + size))
		.filter((a) => a.length === size);

const allPossibleSlices = <T>(_arr: T[], standin: T) => {
	const arr = _arr.concat([standin]);
	return arr.map((_, i) =>
		arr.map((_, k) => k).filter((k) => k > i).map((k) =>
			[i, k] as [number, number]
		)
	).flat();
};
//console.log(windows(2)([1, 2, 3, 4, 5]));

type WordPos = number;

type Fragment = [WordPos, WordPos][];
type Line = [WordPos, WordPos][];

const hasGaps = (side: number) => (fr: Fragment) => {
	const posxs = fr.map(getIdx(side)).sort((a, b) => a - b);
	const wdw = windows(2)(posxs);
	return wdw.map(([a, b]) => (a - b) > 2).some((x) => x);
};

// side 1 because side 0 is always going to be 1, 2, 3, 4, etc.
const isGood = (fr: Fragment) => !hasGaps(0)(fr); //&& !hasGaps(1)(fr);

const makeDict = (lines: Line[]) => (referenceLines: string[]) => {
	type Arrow = string;
	type Occurrences = number;
	const seg = new Intl.Segmenter(undefined, { granularity: "word" });
	const segment = (s: string) =>
		[...seg.segment(s.toLowerCase())].filter((x) => x.isWordLike)
			.map(
				(x) => x.segment,
			);
	const frqs: Record<Arrow, Occurrences> = {};
	lines.forEach((line, i) => {
		const [words0, words1] = referenceLines[i].split(" ||| ").map(segment);
		const slices = allPossibleSlices(line, [0, 0]);
		slices.map((slice) => line.slice(slice[0], slice[1])).filter((slice) =>
			isGood(slice)
		)
			.forEach((slice) => {
				const range0 = slice.map(getIdx(0)); // eng, correct
				const range1 = slice.map(getIdx(1)); // afrikaans
				const sorted0 = [...range0].sort((a, b) => a - b);
				const side1 = range1.map((w) => words1[w]).join(" "); // english joined, in order
				const side0 = range0.slice(sorted0[0], sorted0.at(-1)! + 1)
					.map((w) => words0[w]).join(" ");
				// min and max of afrikaans, joined, but not sorted properly.
				// you take the minimum and the maximum.
				// word order for english is wrong
				console.log(side0);
				console.log(side1); // might not print it if

				slice.forEach(([i0, i1]) => {
					if (!(words0[i0] && words1[i1])) return;
					const arrow = words0[i0] + " ||| " + words1[i1];
					frqs[arrow] = (frqs[arrow] || 0) + 1;
				});
			});
	});
	return Object.entries(frqs).sort((a, b) => b[1] - a[1]);
}; // this creates a dictionary but not a phrase-table, which is what we wanted.

/*
console.log(res.slice(0, 1000))

*/

// look up how I did it before

const sentences = await Deno.readTextFile(
	`en-wol-filtered.tsv`,
).then((d) => d.split("\n").map((x) => x.split("\t") as [string, string])).then(
	(s) =>
		preAlignmentFilter({
			direction: [0, 1],
			preprocess: true,
			sentences: s,
		}),
);

await Deno.writeTextFile(
	`preprocessing-scripts/eflomal-scrape/english-wolof.txt`,
	sentences.text,
);

await alignerClient.post(sentences).then((xs) =>
	Deno.writeTextFile(
		`preprocessing-scripts/eflomal-scrape/english-wolof.align`,
		xs,
	)
).then(console.log);

/*const res = makeDict(
	await Deno.readTextFile(
		`preprocessing-scripts/eflomal-scrape/alignments-afr.align`,
	)
		.then((data) => data.split("\n").map((x) => JSON.parse(x))),
)(
	await Deno.readTextFile(
		`preprocessing-scripts/eflomal-scrape/afrikaans.txt`,
	).then((x) => x.split("\n")),
);
*/
//console.log(res.slice(0, 1000))

// /Users/ckoshka/programming/rust-experiments/langwitch_scripts/augment/_tt_media_theory_proc/english-afrikaans-topics_media_theory-ord3-gtrans-2022.tsv
