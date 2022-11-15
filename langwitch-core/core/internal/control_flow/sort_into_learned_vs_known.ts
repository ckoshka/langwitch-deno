import { Concept } from "../../deps.ts";
import { useMarkers } from "../core/mark_concepts.ts";

/**
 * Utility function for sorting concepts into known vs learning.
 */
export const updateLearnedAndKnown = (
	learnedBefore: Iterable<string>,
	knownBefore: Iterable<string>,
	graduatedIds: Array<string>,
) => {
	const learning = new Set(learnedBefore);
	const known = new Set(knownBefore);
	graduatedIds.forEach((i) => {
		learning.delete(i);
		known.add(i);
	});
	return { learning, known };
};

/**
 * Adds new concepts to the database.
 */
export const updateDbWithNew =
	(rec: Record<string, Concept>) => (learning: Iterable<string>) =>
		useMarkers.map2((f) =>
			Array.from(learning).map((id) =>
				rec[id] !== undefined ? rec[id] : f.markNew({
					name: id,
				})
			)
		);
// unclear, needs revision
