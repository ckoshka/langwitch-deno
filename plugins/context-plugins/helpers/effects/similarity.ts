export type PartialStringSimilarityEffect<
	Min extends number,
	Max extends number,
> = {
	partialSimilarity: (substring: string) => (biggerString: string) => number;
};
