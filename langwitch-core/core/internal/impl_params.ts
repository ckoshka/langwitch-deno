import { ParamsReader } from "../deps.ts";

export const implParams: ParamsReader = {
	$params: ({
		maxLearnable: 3,
		maxConsiderationSize: 12,
		flexibility: 0.0954,
		initialDecay: -0.501,
		knownThresholdSeen: 3,
		knownThresholdProbabilityRecall: 0.3,
		knownThresholdDecayCurve: -0.36,
		artificialKnownnessFactor: 2,
		fractionDiscardOldContexts: 0.5,
		$contexts: {
			topFractionContextRandomisation: 0.3,
			lengthPenaltyLog: 0.27,
			probabilityRandomShuffle: 0.5
		}
	}),
};
