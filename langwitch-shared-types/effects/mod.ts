import { TimeEffect } from "../deps.ts";
import { ParamsReader } from "../types/session_inputs.ts";
import { MemoryConstantsReader } from "../types/memory.ts";

export type CoreEffects =
	& TimeEffect<{ hoursFromEpoch: number }>
	& ParamsReader
	& MemoryConstantsReader;
