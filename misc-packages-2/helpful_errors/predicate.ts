const where = <T>(fn1: (a0: unknown) => a0 is T) => {
	return {
		like: fn1,
		and: <Z>(fn2: (a0: unknown) => a0 is Z) =>
			where((a0: unknown): a0 is Z & T => fn1(a0) && fn2(a0)),
		or: <Z>(fn2: (a0: unknown) => a0 is Z) =>
			where((a0: unknown): a0 is Z | T => fn1(a0) || fn2(a0)),
		unless: <Z extends T | Partial<T>>(fn2: (a0: unknown) => a0 is Z) =>
			where((a0: unknown): a0 is Exclude<T, Z> => fn1(a0) && !fn2(a0)),
	};
};

const hasJustT = (a: unknown): a is { t: true } => true;
const hasZ = (a: unknown): a is { z: true } => true;
const hasN = (a: unknown): a is { n: true } => true;

const pred = where(hasJustT)
	.or(hasZ)
	.and(hasN)
	.unless(hasZ);

const x = 2 as unknown;
if (pred.like(x)) {
	x.t;
	//x.z;
	x.n;
}

// combining lenses with pattern matching would be cool. compositional pattern-matching?

//throw LangwitchError("bingus")({ why: "", how: [], name: "BingusError" })();
