export type AwaitedRecord<T extends Record<string, unknown>> = {
	[K in keyof T]: T[K] extends Promise<infer K> ? K : T[K];
};

export const awaitRecord = async <Rec extends Record<string, unknown>>(
	rec: Rec,
): Promise<AwaitedRecord<Rec>> => {
	const obj = new Object() as any;
	const promises = await Promise.all(
		Object.keys(rec).map(async (k) => [k, await rec[k]] as const),
	);
	promises.forEach(([key, prom]) => obj[key] = prom);
	return obj as AwaitedRecord<Rec>;
};
