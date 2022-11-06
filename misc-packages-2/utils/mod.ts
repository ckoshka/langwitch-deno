import { produce } from "../../plugins/deps.ts";

export const makeRecord = <T>(via: (a0: T) => string) => (data: T[]) => {
	const rec: Record<string, T> = {};
	data.forEach((c) => rec[via(c)] = c);
	return rec;
};

export const modifiable = <T>(item: T) => {
	return {
		modify: (draft: (a0: T) => void | T) =>
			modifiable(produce(item, draft)),
		get: () => item,
	};
};
