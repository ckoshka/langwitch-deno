import { int } from "./deps.ts";

export type WorkerContext = {
	all: Set<int>;
	unknowns: Set<int>;
	id: int;
};

export const newContext = (
	{ id, unknowns }: { id: int; unknowns: Set<int> },
) => {
	const un = new Set(unknowns);
	return {
		all: un,
		unknowns: un,
		id,
	};
};
