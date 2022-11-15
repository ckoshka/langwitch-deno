import { Concept, CoreEffects, Database, use } from "../../deps.ts";
import { Mem } from "../core/memory.ts";

/**
 * At the start of each session, this resorts concepts into either "known" or "learning".
 */
const sortConcepts = (concepts: Array<Concept>) =>
	use<CoreEffects>().map2(
		(f) => {
			const known: string[] = [];
			const learning: string[] = [];
			const { predict } = Mem({ logBase: f.readLogBase });
			concepts.forEach((c) =>
				predict({ when: f.now().hoursFromEpoch, memory: c }) > f.$params.knownThresholdProbabilityRecall &&
					c.timesSeen >= f.$params.knownThresholdSeen //! sacrifices purity and also parameterisation
					? known.push(c.name)
					: learning.push(c.name)
			);
			return [known, learning] as [string[], string[]];
		},
	);

/**
 * Initialises an empty State from a concept database
 */
export const refresh = (db: Database) =>
	sortConcepts(Object.values(db.concepts)).map(([known, learning]) => ({
		db,
		known,
		learning,
		queue: [],
	}));
