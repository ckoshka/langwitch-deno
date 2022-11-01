export const cached = <K extends string | number | symbol, V>(
	fn: (a0: K) => V,
) =>
(cache: Map<K, Readonly<V>>) =>
(key: K): Readonly<V> =>
	cache.get(key) || cache.set(key, Object.freeze(fn(key))).get(key)!;

export const cachedA = <K extends string | number | symbol, V>(
	fn: (a0: K) => V | Promise<V>,
) =>
(cache: Map<K, Readonly<V>> = new Map()) =>
async (key: K): Promise<Readonly<V>> =>
	cache.get(key) ||
	cache.set(key, Object.freeze(await Promise.resolve(fn(key)))).get(key)!;
