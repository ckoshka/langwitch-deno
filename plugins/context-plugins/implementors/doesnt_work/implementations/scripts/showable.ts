import { Br, Cls, Line, Renderable } from "../../deps.ts";

export const ShowResults = ({
	referenceAnswer,
	conceptScores,
}: {
	referenceAnswer: string;
	conceptScores: [string, number][];
}): Renderable => ({
	data: [
		Br,
		["primary", "(❀ˆᴗˆ) my transliteration was:"],
		["secondary underlined", referenceAnswer],
		Br,
		...conceptScores.map((
			[concept, score],
		) => [
			"tertiary underlined",
			`${concept} ➤ ${Math.round(score * 100)}`,
		] as Line),
		Br,
	],
	sticky: false,
});

export const ShowPrompt = ({
	translation,
}: {
	translation: string;
}): Renderable => ({
	data: [
		Cls,
		Br,
		["secondary", "try transliterating this word!"],
		["secondary", "i separated it into its graphemes ૮ ˶ᵔ ᵕ ᵔ˶ ა"],
		Br,
		["primary", `  ${Array.from(translation).join(" ")}  `],
		["secondary italic", "  or"],
		["primary", `  ${translation}  `],
		Br,
		["primary 80", `♡♡ type * as a placeholder if you don't know`],
		Br,
		[`tertiary 70`, `🅺  = i know every grapheme here`],
		[`tertiary 60`, `🆇  = save and exit`],
		Br,
	],
	sticky: false,
});
