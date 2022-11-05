import { EffectsOf, MarkedResult, Message, State, use } from "../../../deps.ts";
import { nextState } from "../../../hint-plugins/deps.ts";
import { ToProcess } from "../../../state-transformers/mod.ts";

export type NextStateEffects = EffectsOf<
	ReturnType<ReturnType<typeof nextState>>
>;

export default use<NextStateEffects>().map2((
	fx,
) => async (m: Message<ToProcess, State>) => ({
	state: await nextState(m.state)(m.data.results as MarkedResult)
		.run(fx),
	data: null,
	next: "quiz",
}));
