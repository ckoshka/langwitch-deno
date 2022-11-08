// This is for exporting to other programming languages via quicktype
export type Database = {
	concepts: Record<string, Concept>;
};

export type State = {
	db: Database;
	known: string[]; 
	learning: string[];
	queue: BaseContext[];
};

export type BaseContext = {
	concepts: Array<string>;
	id: number;
	metadata: Record<string, {}>;
}

// E = 1.16828

export type MemoryConstantsReader = {
	readLogBase: number;
};

export type Concept = {
    lastSeen: number;
	decayCurve: number;
    name: string;
	timesSeen: number;
	firstSeen: number;
};

export type CoreParams = {
	flexibility: number; // should be around 0.07
	initialDecay: number; // should be -0.5

	maxPerSession: number; // defaults to 150
	maxLearnable: number; // defaults to 3
	maxConsiderationSize: number; // defaults to 7
	knownThresholdSeen: number;
	knownThresholdProbabilityRecall: number;
	knownThresholdDecayCurve: number; // should be -0.4

	$contexts: {
		topFractionContextRandomisation: number;
		lengthPenaltyLog: number;
		probabilityRandomShuffle: number;
	},

	artificialKnownnessFactor: number;
	fractionDiscardOldContexts: number;
	// larger: better on word memorisability
	// smaller: better on path-optimality
};

export type MarkedResult = [string, number][];