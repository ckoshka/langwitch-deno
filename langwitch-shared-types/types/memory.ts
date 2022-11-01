import { ReadEffect } from "../deps.ts";

export type Hours = number;
export interface Memory {
	lastSeen: Hours;
	decayCurve: number;
}

// E = 1.16828

export type MemoryConstantsReader = ReadEffect<"readLogBase", number>;
