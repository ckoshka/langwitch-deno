import { BaseContext } from "./context.ts";
import { Database } from "./database.ts";

// the reversing of hashes should be threaded through as an IO input
// likewise, the IO stuff like showing and receiving answers could also be handled via a Free monad

export type State = {
	db: Database;
	known: string[]; // this must be an array instead of a set because immer can't serialise them
	learning: string[];
	queue: BaseContext[];
	stats: Stats; // some of these properties are clearly stateful, others are just calculated from the other data, some are even just static
};

export type Stats = {
	learnCount: number;
	knownCount: number;
};

// average rates? other metadata that permits calculation
