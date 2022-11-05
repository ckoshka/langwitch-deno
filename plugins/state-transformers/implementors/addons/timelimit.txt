import { Component, Message, State, use } from "../../deps.ts";
import { PrinterEffect } from "../../helpers/effects/print.ts";
import { ToMark } from "../message_types.ts";

export type MinutesSinceBeginningEffect = {
	minutesSinceBeginning: () => number;
};

export default ({ maxMinutes }: { maxMinutes: number }) =>
<T>(
	m: Message<T, State>,
) => use<MinutesSinceBeginningEffect & PrinterEffect>().map2(async (fx) => {
	if (fx.minutesSinceBeginning() > maxMinutes) {
		await fx.print(displayMsg(maxMinutes, m.state.stats.learnCount));
		return {
			data: null,
			state: m.state,
			next: "exit",
		} as never;
	}

	return m;
});

const displayMsg = (mins: number, wordsLearned: number): Component => [
	["neutral", `⏰ ${mins} minutes have passed, let's both take a small nap`],
	["neutral", `you learned ${wordsLearned} new concepts`],
];
