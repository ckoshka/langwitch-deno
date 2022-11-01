import { ParamsReader } from "../deps.ts";

export const implParams = (startTimestamp: number) =>
	<ParamsReader> {
		params: ({
			maxLearnable: 6,
			maxPerSession: 245,
			maxConsiderationSize: 20,
			flexibility: 0.09,
			initialDecay: -0.5,
			knownThreshold: -0.36,
			metadata: {
				startTimestamp,
			},
		}),
	};
