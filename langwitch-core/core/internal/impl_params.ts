import { ParamsReader } from "../deps.ts";
import { mixContexts } from "./mix_contexts.ts";

export const implParams: ParamsReader = {
	$params: ({
		maxLearnable: 3,
		maxConsiderationSize: 12,
		flexibility: 0.0854,
		initialDecay: -0.50,
		knownThresholdSeen: 3,
		knownThresholdProbabilityRecall: 0.3,
		knownThresholdDecayCurve: -0.36,
		artificialKnownnessFactor: 10,
		$contexts: {
			topFractionContextRandomisation: 0.15,
			lengthPenaltyLog: 0.27,
			probabilityRandomShuffle: 0.5,
			mix: mixContexts(0.4)
		}
	}),
};
