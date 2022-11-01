export const sortFreq = (a: [string, number]) => a[1];

export const cardinalise = (table: Map<string, number>): [string, number][] =>
	Array.from(table.entries())
		.sort((a, b) => sortFreq(b) - sortFreq(a))
		.map(([word, _freq], i) => [word, i]);

export const invert = (table: Map<string, number>): [number, string][] =>
	Array.from(table.entries())
		.sort((a, b) => sortFreq(b) - sortFreq(a))
		.map(([word, _freq], i) => [i, word]);

export const truncate =
	(len: number) => (pretable: [string, number][]): Map<string, number> =>
		pretable
			.slice(0, len)
			.reduce((prev, curr) => prev.set(curr[0], curr[1]), new Map());

export const col =
	({ sep, column }: { sep: string; column: number }) => (line: string) =>
		line.split(sep)[column];

export const exponentialMovingAverage =
	(calculateLastN: number) => (history: number[]): number => {
		const lastN = history.slice(
			Math.max(0, history.length - calculateLastN),
			history.length,
		);
		const sum = lastN.reduce((acc, curr) => acc + curr, 0);
		return sum / lastN.length;
	};
