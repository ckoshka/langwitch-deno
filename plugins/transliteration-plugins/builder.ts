// builds a transliterator effect, returns an anonymous function which can then be used to implement those effects (you may want the same one twice)

import { Maybe, Rem } from "../deps.ts";

// build using client, policy, backups, allow for easy testing.

// probably do things in bulk, apply filtering to remove weird punctuation that wiktra might dislike

export type FallibleFn<T> = (
	s: string,
) => Promise<Maybe<T>> | Maybe<T>;

export const tryMany = <T>(fns: FallibleFn<T>[]) => {
	const failures = fns.map((fn, i) => ({
		totalFailures: i + 1,
		timesTried: i + 1,
		fn,
	}));
	return async (s: string) => {
		const sorted = Rem.sort<typeof failures[0]>((a, b) =>
			(a.totalFailures / a.timesTried) - (b.totalFailures / b.timesTried)
		)(failures);

		for (const fn of sorted) {
			fn.timesTried += 1;
			try {
				const result = await fn.fn(s);
				if (result.isSome()) return result;
			} catch {
				fn.totalFailures += 1;
			}
		}

		return Maybe.none();
	};
};

// todo: actually test, see how fast it is, if it's actually put-up-withable