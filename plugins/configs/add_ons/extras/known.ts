import {
	isMatching,
	Message,
	produce,
	State,
	useMarkers,
} from "../../../deps.ts";
import { ToMark, ToProcess } from "../../../state-transformers/mod.ts";

export default (keyBinding = "!k") => useMarkers.map2((fx) =>
	async (
		m: Message<ToMark, State>,
	) => {
		if (m.data?.userAnswer?.toLowerCase().trim().startsWith(keyBinding)) {
			const newState = await markKnown(m.state).run(fx);

			return <Message<ToProcess, State>> {
				data: {
					results: [],
					userAnswer: "",
				},
				state: newState,
				next: "process", // bifurcating output is a problem for chaining
			}
		}

		return m;
	}
);

export const markKnown = (state: State) =>
	useMarkers.map2((fx) =>
		produce(state, (draft) => {
			const currentConcepts = draft.queue[0].concepts;

			const isCurrentlyLearning = (c: string) =>
				draft.db.concepts[c].decayCurve <
					fx.params.knownThreshold;

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
