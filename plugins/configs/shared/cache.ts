import { hashObject } from "../../deps.ts";

export type CacheConfig<K, V> = {
    getter: (k: K) => Promise<V>;
}
export const Cache = <K, V>(cfg: CacheConfig<K, V>) => {
    const cache = new Map<string, V>();
    return {
        get: async (k: K) => {
            const hash = hashObject(k);
            const existing = cache.get(hash);
            if (existing) return existing;
            const item = await cfg.getter(k);
            cache.set(hash, item);
            return item;
        }
    }
}