import {
	isMatching,
	Message,
	produce,
	revisable,
	State,
	useMarkers,
} from "../../../deps.ts";
import {
	LangwitchMessage,
	ToMark,
	ToProcess,
} from "../../../state-transformers/mod.ts";

export default (keyBinding = "!k") =>
	useMarkers.map2((fx) =>
	async (
		m: LangwitchMessage,
	) => {
		if (
			m.data?.userAnswer?.toLowerCase().trim().startsWith(keyBinding)
		) {
			const conceptsToMarkKnown = m.data.userAnswer === keyBinding ? [] : m.data.userAnswer.split(" ").slice(1);

			const newState = await markKnown(m.state)(conceptsToMarkKnown).run(fx);

			return revisable(m)
				.revise({
					state: newState,
					next: "process",
					data: {
						results: [],
						userAnswer: "",
					},
				}).contents;
		}

		return m;
	});

export const markKnown = (state: State) => (toMarkKnown: string[]) =>
	useMarkers.map2((fx) =>
		produce(state, (draft) => {
			const currentConcepts = toMarkKnown.length === 0 ? draft.queue[0].concepts : toMarkKnown;

			const isCurrentlyLearning = (c: string) =>
				draft.db.concepts[c].decayCurve <
					fx.$params.knownThresholdDecayCurve;

			currentConcepts.map((c) =>
				isCurrentlyLearning(c)
					? draft.db.concepts[c] = fx.markKnown(
						draft.db.concepts[c],
					)
					: {}
			);
			// lenses here might not be performant

			const learning = new Set(draft.learning);
			const known = new Set(draft.known);
			currentConcepts.forEach((c) => {
				learning.delete(c); // this whole chunk set -> array seems generalisable
				known.add(c);
			});
			draft.learning = Array.from(learning);
			draft.known = Array.from(known);
		})
	);
