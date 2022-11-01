
type FreqIndex = number;
type Word = string;

export type GuessingState = {
	pastGuesses: number[];
	sampleSize: number;
	table: [FreqIndex, Word][];
	complete: boolean;
};

export type GuessResult = {
	knownCount: number;
	words: string[];
};

