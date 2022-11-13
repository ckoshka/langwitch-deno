import { BaseContext } from "./context.ts";

export type CoreParams = {
	flexibility: number; // should be around 0.07
	initialDecay: number; // should be -0.5

	maxLearnable: number; // defaults to 3
	maxConsiderationSize: number; // defaults to 7
	knownThresholdSeen: number;
	knownThresholdProbabilityRecall: number;
	knownThresholdDecayCurve: number; // should be -0.4

	$contexts: {
		topFractionContextRandomisation: number;
		lengthPenaltyLog: number;
		probabilityRandomShuffle: number;
		mix: (oldCtxs: BaseContext[]) => (newCtxs: BaseContext[]) => BaseContext[];
	},

	artificialKnownnessFactor: number;
	// larger: better on word memorisability
	// smaller: better on path-optimality
};

export type ParamsReader = { $params: CoreParams };

// okay, but what if the user leaves for a while? so we need a 'pause' command to temporarily stop the timer.
// we also need some data about rates of previous learning? in order to be motivational
// a metadata property
// - when the session started
// - what language it is??? - no
// good pattern - clearly separate the configuration from the interpretation, into different modules

// invert this? the io calls the state, not the other way around. this makes more sense because io will be able to handle commands, then we get a clean separation. callback passed into the state, then result returned as a promise.resolve?
// generally we want to minimise the amount of state being shared with io. or do we?
// the io should just be a lens through which to view the state
// so how is marking handled?
// the state just needs to be able to expose itself for io querying, and to get a Record<concept, score> to update itself.

// structure - onion rings of immutable configuration data creating each other in sequence, starting from the most concrete and impure to the most abstract and pure
