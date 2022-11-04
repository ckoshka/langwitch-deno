export type EnsureArgs<T> = {
	try: () => T;
	catch: (e: unknown) => T;
};

const isAsync = (fn: Function) => fn.constructor.name === "AsyncFunction";

export const ensure = <T>(
	args: EnsureArgs<T>,
): T extends Promise<infer K> ? Promise<K> : T => {
	if (isAsync(args.try) || isAsync(args.catch)) {
		return (async () => {
			try {
				return await args.try();
			} catch (e) {
				return await args.catch(e);
			}
		})() as any;
	} else {
		return (() => {
			try {
				return args.try();
			} catch (e) {
				return args.catch(e);
			}
		})() as any;
	}
};
