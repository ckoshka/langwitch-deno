import { Concept, Message, State, use } from "../../deps.ts";

export type SaveConceptsEffect = {
	saveConcepts: (concepts: Concept[]) => void;
};

export default <T>(m: Message<T, State>) =>
	use<SaveConceptsEffect>()
		.map2((fx) => {
			fx.saveConcepts(Object.values(m.state.db.concepts));
			return m;
		});
