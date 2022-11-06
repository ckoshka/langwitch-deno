import {
BaseContext,
	Concept,
	ConceptFilterEffect,
	CoreEffects,
	Database,
	Free,
	LoggerEffect,
	ParamsReader,
	produce,
	State,
	StateCalculationEffects,
	TapEffect,
	use,
} from "../../deps.ts";
import {
	updateDbWithNew,
	updateLearnedAndKnown,
} from "./sort_into_learned_vs_known.ts";

const noneGraduated = (ids: string[]) => ids.length === 0;
const atFullLearningCapacity = (max: number) => (learning: string[]) =>
	learning.length >= max;

export const findGraduated =
	(db: Database) => (currConcepts: Set<string> | Array<string>) =>
		use<ParamsReader>().map2((f) =>
			Array.from(currConcepts).filter((cid) => {
				const c = db.concepts[cid];
				return c.decayCurve > f.params.knownThreshold; //?????
			})
		);

export const checkGraduation = (s1: State) =>
	use<
		& ParamsReader
		& TapEffect
		& CoreEffects // redundant
		& StateCalculationEffects
		& LoggerEffect
		& ConceptFilterEffect
	>()
		.chain(() =>
			findGraduated(s1.db)(
				new Set(s1.learning),
			)
		).chain(async (graduatedIds, f) => {
			f.log(s1);

			if (
				noneGraduated(graduatedIds) &&
				atFullLearningCapacity(f.params.maxLearnable)(
					s1.learning,
				)
			) {
				return Free.lift(s1) as never;
			}

			const cfg = f.params;

			const { learning, known } = updateLearnedAndKnown(
				s1.learning,
				s1.known,
				graduatedIds,
			);

			const ids = await f.nextConcepts(
				{ knowns: known, total: cfg.maxConsiderationSize },
			);

			const orderedByGoodness = f.filterConcepts(
				[...ids],
				ids.size,
			);

			let queueOfNewItems: BaseContext[] = [];
			let i = f.params.maxLearnable - learning.size;
			const proposedForLearning = new Set(Array.from(learning).concat(orderedByGoodness.slice(0, Math.max(0, i))));
			// question: are there any cases where maxLearnable - learning.size = 0?
			// which would cause it to wrap around...

			const currentItemsInQueueById = new Set(
				s1.queue.map((i) => i.id),
			);

			while (queueOfNewItems.length === 0 && i <= orderedByGoodness.length) {
				proposedForLearning.add(orderedByGoodness[i]);
				const proposedQueue = await f.nextContexts(
					{ knowns: known, focus: proposedForLearning },
				);
				const notInQueueAlready = proposedQueue.filter((ctx) => !currentItemsInQueueById.has(ctx.id));
				queueOfNewItems = queueOfNewItems.concat(notInQueueAlready);
				notInQueueAlready.forEach(ctx => currentItemsInQueueById.add(ctx.id));
				i++;
			}



			return updateDbWithNew(s1.db.concepts)(proposedForLearning).map(
				(updates) => ({ updates }),
			)
				.map((rec) => {
					return {
						...rec,
						queue: queueOfNewItems.concat(
								s1.queue.slice(
									Math.floor(queueOfNewItems.length / 2),
								),
							).filter((c) => c !== undefined),
					};
				})
				.map((rec) => {
					// update the database via immer

					const concepts = produce(
						s1.db.concepts,
						(dbDraft: Record<string, Concept>) => {
							rec.updates.forEach((m) => dbDraft[m.name] = m);
						},
					);

					const s2: State = {
						...s1,
						db: {
							...s1.db,
							concepts,
						},
						known: Array.from(known),
						queue: rec.queue,
						learning: Array.from(proposedForLearning),
					};

					f.log(s2);

					return s2;
				});

			// todo: make this more declarative
			// this is an area where i notice mistakes in a lot, maybe 80% of them
			// and i find myself constantly tweaking different parameters and
			// changing the types of the inputs because i'm not 100% sure that
			// they're actually behaving as expected
			//
			// the annoying thing is, none of these transformations are reflected
			// in the type-system itself
			// the "have whether the queue is non-empty reflected as a generic"
			// was a good step, but we ended up erasing that information so as to
			// allow for sharing of the state with the IO frontend.
			//
			// and there are no 'hard' conditions under which the function will
			// fail completely, causing intermediate error-states that propagate
			// forward, causing unpredictable behaviours, violated expectations,
			// and invalid states.
			// the consequence is that it's essentially as if the function is mutating
			// the state.
			//
			// the only benefit of having it organised like this is
			// that it means several different states can be "simulated"
			// concurrently, i.e if the user is still typing an answer, we can go ahead
			// and anticipate 0, 30, 50, 70, 100 scores, then recalculate a new state
			// for each of them, so that there is absolutely no lag
			//
			// ideally we want to hide the ugly imperative execution away
			// leaving a modifiable configuration object
		});
