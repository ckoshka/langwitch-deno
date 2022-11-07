export const toWords = (s: string) =>
	[...new Intl.Segmenter(undefined, { granularity: "word" }).segment(
		s.toLowerCase(),
	)].filter((s) => s.isWordLike).map((s) => s.segment);