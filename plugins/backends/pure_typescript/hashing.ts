import { fnv, int } from "./deps.ts";

export const Hasher = (lazy = false) => {
	const cache = new Map<int, string>();

	const hash = (() => {
		let counter = 1;
		const alreadySeen = new Map();
		return lazy
			? (text: string): int => {
				return alreadySeen.get(text) ??
					(counter += 1,
						alreadySeen.set(text, counter),
						cache.set(counter as int, text),
						counter);
			}
			: (text: string): int => {
				const result = fnv.fast1a32(text) as int;
				cache.set(result, text);
				return result as int;
			};
	})();

	const unhash = (id: int) => {
		const result = cache.get(id);
		if (result === undefined) {
			throw new Error(`I don't have a reverse hash for ${id}`);
		}
		return result;
	};

	const values = () => cache.values();
	const keys = () => cache.keys();

	return { hash, unhash, values, keys };
};

export type Hasher = ReturnType<typeof Hasher>;
