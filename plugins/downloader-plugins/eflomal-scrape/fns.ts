import { Rem } from "./deps.ts";

const align = (sentence: string): number[][] =>
	sentence.split(" ").map((s) =>
		s.split("-").map((c) => parseInt(c)).filter((c) => c > 0)
	);

const indices = (xss: number[][]): number[][][] =>
	xss.map((_, j) => xss.map((_, i) => [i, j]).filter((i) => i[0] < i[1]));

const hasNoGaps = (xs: number[]): boolean =>
	xs.slice(0, xs.length - 1).every((x, n) =>
		x - xs[n + 1] == -1 || xs[n + 1] - x == 0
	);

const isRising = (xs: number[]): boolean =>
	xs.slice(0, xs.length - 1).every((x, n) => x - xs[n + 1] == -1);

const dedup = <T>(xs: T[]): T[] => {
	const seen_before = new Set();
	return xs.filter((x) => {
		if (seen_before.has(x)) {
			return false;
		}
		seen_before.add(x);
		return true;
	});
};

/*def yield_phrases(s1: List[str], s2: List[str], alignment: List[List[int]]):
    all_possible = pipe (indices, flat, filter (lambda x: len (x) == 2)) (alignment)
    for begin, end in all_possible:
        seg = alignment[begin:end]
        if len(seg) == 0:
            continue
        seg_s1 = sorted([p[0] for p in seg])
        seg_s2 = sorted([p[1] for p in seg])
        if has_no_gaps(seg_s1) and is_rising(seg_s2):
            yield [" ".join(dedup(s1[n] for n in seg_s1)), " ".join(s2[part[1]] for part in seg)]*/

const yieldPhrases = function* (
	s1: string[],
	s2: string[],
	alignment: number[][],
) {
	const allPossible = Rem.pipe(
		alignment,
		indices,
		Rem.flatten(),
		Rem.filter((x) => x.length === 2),
	);
	for (const [begin, end] of allPossible) {
		const seg = alignment.slice(begin, end);
		if (seg.length === 0) {
			continue;
		}
		const segS1 = seg.map((p) => p[0]).sort((a, b) => a - b);
		const segS2 = seg.map((p) => p[1]).sort((a, b) => a - b);
		if (hasNoGaps(segS1) && isRising(segS2)) {
			yield [
				dedup(segS1.map((n) => s1[n])).join(" "),
				seg.map((part) => s2[part[1]]).join(" "),
			];
		}
	}
};

type WordPos = number;
type Line = [WordPos, WordPos][];

const makeDict = (alignments: string[]) => (referenceLines: string[]) => {
	type Arrow = string;
	type Occurrences = number;
	const seg = new Intl.Segmenter(undefined, { granularity: "word" });
	const segment = (s: string) =>
		[...seg.segment(s.toLowerCase())].filter((x) => x.isWordLike)
			.map(
				(x) => x.segment,
			);
	const frqs: Map<Arrow, Occurrences> = new Map();
	let count = 0;
	for (const alignment of alignments) {
		try {
			const [s1, s2] = referenceLines[count].split(" ||| ");
			for (
				const [eng, original] of yieldPhrases(
					segment(s1),
					segment(s2),
					align(alignment),
				)
			) {
				const key = eng + "\t" + original;
				if (key.length > 1) {
					frqs.set(key, (frqs.get(key) || 0) + 1);
				}
			}
		} catch (e) {
			console.error(e);
		}
		count += 1;
		if (frqs.size % 200 === 0) {
			console.error(frqs.size);
		}
	}

	return Array.from(frqs.entries()).sort((a, b) => b[1] - a[1]);
};

(async () => {
	const alignments = Deno.readTextFileSync(
		`preprocessing-scripts/eflomal-scrape/alignments-afr.align`,
	).split("\n");
	const referenceLines = Deno.readTextFileSync(
		`preprocessing-scripts/eflomal-scrape/afrikaans.txt`,
	).split("\n");
	const results = makeDict(alignments)(referenceLines).filter((a) =>
		a[1] > 1
	);
	results.map((r) => [...r[0].split("\t"), r[1]].join("\t")).map((r) =>
		console.log(r)
	);
})();
