import { Concept, Message, State, use } from "../../../deps.ts";

export type SaveConceptsEffect = {
	saveConcepts: (concepts: Concept[]) => void;
};

export default use<SaveConceptsEffect>()
	.map2((fx) => <T>(m: Message<T, State>) => {
		fx.saveConcepts(Object.values(m.state.db.concepts));
		return m;
	});
