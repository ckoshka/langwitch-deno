import {
	EffectsOf,
	MarkedResult,
	Message,
	revisable,
	State,
	use,
	UserInputEffect,
} from "../../../deps.ts";
import { nextState } from "../../../hint-plugins/deps.ts";
import { ToProcess } from "../../../state-transformers/mod.ts";

export type NextStateEffects = EffectsOf<
	ReturnType<ReturnType<typeof nextState>>
>;

export default use<NextStateEffects & UserInputEffect<Promise<string>>>().map2((
	fx,
) => async (m: Message<ToProcess, State>) => {
	await fx.ask("press enter to continue");
	const state = nextState(m.state)(m.data.results as MarkedResult)
		.run(fx);
	return revisable(m).revise({
		state: await state,
		next: "quiz",
	}).extend(() => ({ data: null })).contents;
});
