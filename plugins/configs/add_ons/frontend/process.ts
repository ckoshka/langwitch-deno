import {
	EffectsOf,
	MarkedResult,
	Message,
	revisable,
	State,
	use,
} from "../../../deps.ts";
import { nextState } from "../../../hint-plugins/deps.ts";
import { ToProcess } from "../../../state-transformers/mod.ts";

export type NextStateEffects = EffectsOf<
	ReturnType<ReturnType<typeof nextState>>
>;

export default use<NextStateEffects>().map2((
	fx,
) =>
async (m: Message<ToProcess, State>) =>
	revisable(m).revise({
		state: await nextState(m.state)(m.data.results as MarkedResult)
			.run(fx),
		next: "quiz",
	}).extend(() => ({ data: null })).contents
);
