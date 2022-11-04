export const makeRecord = <T>(via: (a0: T) => string) => (data: T[]) => {
	const rec: Record<string, T> = {};
	data.forEach((c) => rec[via(c)] = c);
	return rec;
};
