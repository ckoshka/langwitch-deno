export const selectPercentile =
	<T>(float: number) => (arr: T[] | readonly T[]) =>
		arr.slice(Math.round(arr.length * float))[0];

export const time = async <T>(fn: () => Promise<T>): Promise<T> => {
	const now = performance.now();
	const result = await fn();
	console.log("Took", performance.now() - now, "ms for", String(fn));
	return result;
};

export const start = (name: string) => {
	const now = performance.now();
	return () => console.log("Took", performance.now() - now, "ms for", name);
};

export const lens = <T, A>(accessor: (a0: T) => A) => (obj: T) => accessor(obj);
export const key = <
	T extends Record<string | number | symbol, unknown>,
	K extends keyof T,
>(key: K) =>
(obj: T) => obj[key];
