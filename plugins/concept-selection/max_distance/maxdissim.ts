// objective; maximise the total dist assigned to the items in previous rounds, while maximising their intra-dissimilarity
// could be done in a dynamic programming approach, or through genetic algorithms
// v1: pick one item. sort the rest by a balance of their existing dists and their dissimilarity. etc.
// expects: lower is better. between 0 and 1.

export interface SimilarityConfig<T> {
	distanceFn: (w: T) => (w2: T) => number;
}

export const scoreBy =
	<T>({ distanceFn }: SimilarityConfig<T>) => (w1: T) => (ws: T[]) =>
		ws
			.map((w) => ({
				candidate: w,
				dist: distanceFn(w1)(w),
			}));

export const mostToLeastUnique = <T>(c: SimilarityConfig<T>) => (wds: T[]) =>
	wds
		.map((w) => ({
			candidate: w,
			total: scoreBy(c)(w)(wds)
				.map((x) => x.dist)
				.reduce((a, b) => a + b),
		}))
		.sort((a, b) => a.total - b.total)
		.map((w) => w.candidate);
