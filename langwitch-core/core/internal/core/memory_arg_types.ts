import { Hours, Memory } from "../../deps.ts";

export type FitMemoryArgs = {
	memory: Memory;
	accuracy: number;
	recordedAt: number;
};

export type RemodelArgs = {
	flexibility: number;
	estimatedCurve: number;
	oldDecay: number;
};

export type PredictArgs = {
	memory: Memory;
	when: Hours;
};

export type HalfLifeArgs = {
	halfLifeDefinition: number;
	memory: Memory;
};
