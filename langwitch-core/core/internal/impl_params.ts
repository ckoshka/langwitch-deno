import { ParamsReader } from "../deps.ts";

export const implParams = <ParamsReader> {
	params: ({
		maxLearnable: 6,
		maxPerSession: 245,
		maxConsiderationSize: 35,
		flexibility: 0.09,
		initialDecay: -0.5,
		knownThreshold: -0.36,
	}),
};
