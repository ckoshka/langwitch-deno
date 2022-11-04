import {
	Concept,
	ConceptName,
	HiderEffect,
	Mem,
	MemoryConstantsReader,
	TimeEffect,
	use,
} from "./deps.ts";

export const makeHint = () =>
	use<
		& HiderEffect
		& TimeEffect<{ hoursFromEpoch: number }>
		& MemoryConstantsReader
	>()
		.map(
			(_, f) =>
			(find: (a0: ConceptName) => Concept) =>
			(words: string[]) => {
				return words
					.map((w) => {
						const concept = find(w as ConceptName);
						if (!concept) return w.length;

						const { predict } = Mem({ logBase: f.readLogBase });

						const proportion = predict({
							memory: concept,
							when: f.now().hoursFromEpoch,
						});
						const lettersShown = w.length -
							Math.pow(proportion, f.readLogBase - 1) *
								w.length;

						return concept.timesSeen < 4
							? Math.max(
								w.length / (concept.timesSeen + 1),
								lettersShown,
							)
							: lettersShown;
					})
					.map(Math.round)
					.map((lettersShown, position) =>
						f.hider.show(lettersShown)(words[position])
					)
					.map((hint) => `${hint} (${hint.length})`)
					.join(" ");
			},
		);

// if concept not found, if some condition, do this, otherwise do this

// how do I encode this as an abstract policy?
// matching a series of situations
// we need some error/either types.
// look at the imports, try and minimise non-type ones
