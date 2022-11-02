// deno-lint-ignore-file no-unused-vars
// 15, 30, 50, 75, 100 ?
// you could use the diff logger, i.e known: -> added new words

// ok, so phase transitions:
// - notify when a new word is being introduced - so this needs to come before
// - notify when a word has graduated
// - notify when a milestone has been reached
// - soft-notify when a word has been relearned / refreshed

// statistics:
// - speed
// - how many (learned/known/planted/watered)
// this should ideally be separated into several different functions

import { Message, State, use } from "../../deps.ts";
import { PrinterEffect } from "../../helpers/effects/print.ts";
import { Br, Cls, Component, WordsPerHourCalculator } from "../deps.ts";

export const UpdateTracker = <T>() => {
	const last = new Set<T>();
	let total = 0;
	return {
		update: (items: T[], notNew = false) => {
			const newItems: T[] = [];
			items.forEach((w) =>
				last.has(w) ? {} : (total += 1, last.add(w), newItems.push(w))
			);
			return notNew ? [] : newItems;
		},
		total: () => total,
	};
};

export default <T>() => {
	let learned = UpdateTracker<string>();
	let known = UpdateTracker<string>();

	const now = () => Date.now() / 1000 / 60 / 60;
	const wphCalculator = WordsPerHourCalculator({
		startDate: now(),
		defaultValue: 0,
		takeLast: 20,
	});

	let notNew = true;

	return (
		m: Message<T, State>,
	) => use<PrinterEffect>().map2(
		async (fx) => {
			const newWords = learned.update(m.state.learning);
			if (newWords.length > 0) {
				await fx.print(newWordIntroduced(newWords));
				const newAvg = wphCalculator.push({
					count: known.total(),
					hoursNow: now(),
				}).avg();
				if (!isNaN(newAvg)) {
					await fx.print(learnRate(newAvg));
				}
			}

			const graduatedWords = known.update(m.state.known, notNew);
			notNew = false;
			if (graduatedWords.length > 0) {
				await fx.print(newWordGraduated(graduatedWords));
				await fx.print(showTotal({
					knownSinceStart: known.total(),
					knownTotal: m.state.known.length,
				}));
			}

			if (graduatedWords.length > 0 || newWords.length > 0) {
				return {
					data: {
						next: m.next,
						msg: "continue?",
					},
					state: m.state,
					next: "ask",
				};
			}
			return m;
		},
	);
};

const showTotal = (
	{ knownSinceStart, knownTotal }: {
		knownSinceStart: number;
		knownTotal: number;
	},
): Component => [
	[
		"primary",
		`(づ ᴗ _ᴗ)づ since the start, you've learned: ${knownSinceStart}`,
	],
	[
		"primary",
		`(૭ ｡•̀ ᵕ •́｡ )૭ in total, you've learned: ${knownTotal}`,
	],
	Br,
];

const newWordIntroduced = (concepts: string[]): Component => [
	Cls,
	Br,
	["primary", "✦ new concepts! ✦"],
	["primary 80", concepts.join(", ")],
	Br,
];

const newWordGraduated = (concepts: string[]): Component => [
	Cls,
	Br,
	["tertiary", "✦ these concepts just graduated! ✦"],
	["tertiary 80", concepts.join(", ")],
	Br,
];

const learnRate = (wph: number): Component => [
	["tertiary", `♡⸜(˃ ᵕ ˂ )⸝ learn rate: ${Math.round(wph)} per hour ✦`],
	Br,
];
