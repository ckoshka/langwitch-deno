import { Concept, ConceptData, CoreEffects, use } from "../../deps.ts";
import { adjust } from "./memory.ts";

export const useMarkers = use<CoreEffects>().extendF((f) => ({
	markNew: (data: { name: string }) => {
		const newConcept = {
			...data,
			lastSeen: f.now().hoursFromEpoch,
			decayCurve: f.params.initialDecay,
			firstSeen: f.now().hoursFromEpoch,
			timesSeen: 0,
		};
		//const adjustBackBy = halfLife(0.1, newConcept);
		return <Concept> {
			...newConcept,
			//lastSeen: cfg.io.currentTime() - adjustBackBy
		};
	},
	markKnown: (data: ConceptData) => ({
		...data,
		lastSeen: f.now().hoursFromEpoch,
		decayCurve: f.params.knownThreshold / 2,
		firstSeen: f.now().hoursFromEpoch,
		timesSeen: 5
	}),
}));

export const validateRange = (min: number, max: number) => (n: number) => {
	if (n < min || n > max) {
		throw new Error(
			`The number provided (${n}) was out of range of (${min}, ${max})`,
		);
	}
};

export const mark = (concept: Concept) => (accuracy: number) => {
	validateRange(0, 1)(accuracy);
	//accuracy *= 0.98;
	//accuracy += 0.02;
	return adjust(concept)(
		accuracy,
	).map((adjustedData) =>
		<Concept> ({
			...concept,
			...adjustedData,
			timesSeen: concept.timesSeen + 1,
		})
	);
};
