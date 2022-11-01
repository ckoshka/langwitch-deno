export type Table = {
	map: Map<string, number>;
	sentences: Sentence[];
};
export type Sentence = {
	line: string;
	words: Set<string>;
	wordArray: Array<string>;
	freq: (t: Table) => number;
};

const seg = new Intl.Segmenter(undefined, { granularity: "word" });
const segment = (s: string) =>
	[...seg.segment(s)].filter((c) => c.isWordLike).map((c) => c.segment);
    
export const Sentence = (s: string) => {
	const words = segment(s);
	const sentence = {
		line: s,
		words: new Set(words),
		wordArray: words,
	};
	const deduped = Array.from(sentence.words);
	return {
		...sentence,
		freq: (table: Table) =>
			deduped.map((w) => table.map.get(w) || 0).reduce((a, b) => a + b) /
			deduped.length,
	};
};

export const SentenceMap = (sx: Sentence[]): Map<string, number> =>
	sx.reduce(
		(prev: Map<string, number>, curr: Sentence) =>
			curr.wordArray.reduce(
				(map: Map<string, number>, word) =>
					map.get(word) === undefined
						? map.set(word, 1)
						: map.set(word, map.get(word)! + 1),
				prev,
			),
		new Map(),
	);
