import {
	EffectsOf,
	MarkedResult,
	Message,
	nextState,
	Phase,
	State,
	use,
} from "../../deps.ts";
import { ToProcess } from "../message_types.ts";

export type NextStateEffects = EffectsOf<
	ReturnType<ReturnType<typeof nextState>>
>;
export default Phase({
	phase: `process`,
	fn: (m: Message<ToProcess, State>) =>
		use<NextStateEffects>().map2(async (fx) => {
			//console.log(m);
			const s1 = await nextState(m.state)(m.data.results as MarkedResult)
				.run(fx);
			return {
				state: s1,
				data: null,
				next: "quiz",
			};
		}),
});
