import { Memory } from "./memory.ts";

export type ConceptName = string & { ___conceptName: never };

export interface ConceptData {
	name: ConceptName;
	timesSeen: number;
	firstSeen: number;
}

export type Concept = Memory & ConceptData;
