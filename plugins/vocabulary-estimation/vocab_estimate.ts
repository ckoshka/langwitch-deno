import { Rem } from "./deps.ts";
import { GuessingState } from "./types.ts";
import { exponentialMovingAverage } from "./utils.ts";

//export const ordinalise;
export type RollingEstimateEffect = {
	updateEstimate: (n: number) => void;
};

const calculateRange = (pastGuesses: number[]) =>
	Rem.pipe(
		pastGuesses,
		exponentialMovingAverage(8),
		(x) => x * 2.5,
		Math.round,
	);

export const guessWords = (state: GuessingState): string[] => {
	const range = state.pastGuesses.length === 0
		? 0
		: calculateRange(state.pastGuesses);

	const words = state.table.slice(range, range + state.sampleSize);

	return words.map((w) => w[1]);
};

export const guessTotalKnown =
	(state: GuessingState) => (numKnown: number): GuessingState => {
		const range = calculateRange(state.pastGuesses);
		const ratio = numKnown / state.sampleSize;
		const newEstimate = (range + state.sampleSize) * ratio;

		const diff = Math.abs(
			1 - (newEstimate / state.pastGuesses.slice(-1)[0]),
		);

		if (state.pastGuesses.length > 20 || diff < 0.02) {
			return {
				...state,
				pastGuesses: [...state.pastGuesses, newEstimate],
				complete: true,
			};
		}
		return {
			...state,
			pastGuesses: [...state.pastGuesses, newEstimate],
		};
	};

export const createNewGuessingState = (
	table: GuessingState["table"],
): GuessingState => ({
	pastGuesses: [0],
	sampleSize: 8,
	complete: false,
	table,
});

export const mkFrqlist = (filename: string) =>
	Deno.readTextFile(filename).then((lines) =>
		lines.split("\n").map((l, i) => [i, l] as [number, string])
	);

/*
mkFrqlist(`plugins/vocabulary-estimation/afrikaans_testdata.frq`)
	//.then(x => (console.log(x), x))
	.then(guess)
	.then((f) =>
		f.run({
			ask: (s) => Number.prompt({ message: s || "", min: 0, max: 8 }),
			updateEstimate: console.log,
		})
	);
*/
