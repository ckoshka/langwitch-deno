import { mark } from "./mark_concepts.ts";
import { Concept, Database, Free } from "../../deps.ts";

/**
 * Marks every specified concept, returns new versions of those concepts.
 */
export const getUpdatedConcepts =
	(db: Database) => (scores: [string, number][]) =>
		Free.flatten(
			scores.filter(([literal, _]) => db.concepts[literal]).map(
				([literal, score]) => {
					const concept: Concept = db.concepts[literal];
					if (concept === undefined) {
						throw new Error(
							"One of the concepts marked was not found in the database.",
						);
					}
					return mark(concept)(score);
				},
			),
		);
