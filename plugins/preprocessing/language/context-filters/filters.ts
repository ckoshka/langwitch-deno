import { punctuation } from "../../deps.ts";

// we want to create short-circuiting hard-filters from light to intense for efficiency
// this is too strict?
type Word = string;
export const overlap = (s1: Set<Word>, s2: Set<Word>) => {
	for (const item of s1) {
		if (s2.has(item) && item.length > 2) {
			return false;
		}
	}
	return true;
};

type RedundancyArgs = {
	maxRepeat: number;
};

export const redundancy =
	({ maxRepeat }: RedundancyArgs) => (len: number, uniqueLen: number) =>
		len - uniqueLen < maxRepeat;

type LengthDifferenceArgs = {
	avg: number;
	fractionTolerance: number;
};

export const lengthDifference = (
	{ avg, fractionTolerance }: LengthDifferenceArgs,
) =>
(l1Len: number, l2Len: number) => {
	const diff = Math.abs(1 - (l1Len / l2Len));
	return avg + fractionTolerance > diff &&
		avg - fractionTolerance < diff;
};

type AlphabeticConfig = {
	maxNonAlphabetic: number;
};

export const nonAlphabetic = (cfg: AlphabeticConfig) => (s: string) => {
	let count = 0;
	for (const c of s) {
		if (punctuation.has(c)) {
			count += 1;
		}
	}
	return (count / s.length) < cfg.maxNonAlphabetic;
};

export const filter = (
	cfg: LengthDifferenceArgs & RedundancyArgs & AlphabeticConfig,
) => {
	const seg = new Intl.Segmenter(undefined, { granularity: "word" });
	const segment = (s: string) => {
		const arr = [];
		for (const word of seg.segment(s)) {
			if (word.isWordLike) {
				arr.push(word.segment);
			}
		}
		return arr;
	};
	// probably don't want to do this twice

	return (s1: string, s2: string) => {
		const a1 = segment(s1);
		const a2 = segment(s2);
		if (!lengthDifference(cfg)(a1.length, a2.length)) return false;

		//if (!nonAlphabetic(cfg)(s1) || !(nonAlphabetic(cfg)(s2))) return false;

		const st1 = new Set(a1);
		//const isNotRedundant = redundancy(cfg);

		//if (!isNotRedundant(a1.length, st1.size)) return false;
		const st2 = new Set(a2);

		//if (!isNotRedundant(a2.length, st2.size)) return false;
		if (!overlap(st1, st2)) return false;

		return true;
	};
};

export const filterArr = <T>(data: T[], toArr: (a0: T) => [string, string]) => {
	let avg = 0;
	for (const d of data) {
		const x = toArr(d);
		avg += Math.abs(1 - (x[0].length / x[1].length));
	}
	avg = avg / data.length;

	const filt = filter({
		avg,
		fractionTolerance: 1.5,
		maxRepeat: 3,
		maxNonAlphabetic: 0.12,
	});

	return data.filter((y) => {
		const x = toArr(y);
		return filt(x[0], x[1]);
	});
};

/*
const blach = await Deno.readTextFile(`/Users/ckoshka/programming/langwitch/ckoshka-personal/data/english-portuguese-statmt.tsv`)
    .then(d => d.split("\n").map(x => x.split("\t") as [string, string]).slice(0, 20000))
console.log("Done loading");
const res = filterArr(blach);
console.log(`Did ${blach.length}, got ${res.length}`);
console.log(res.reverse());
*/
