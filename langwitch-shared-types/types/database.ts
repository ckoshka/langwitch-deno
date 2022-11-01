import { Concept } from "./concept.ts";

export type Database = {
	concepts: Record<string, Concept>;
};
