import { Br, Cls, Component, Line } from "../deps.ts";

export const ShowResults = ({
	referenceAnswer,
	referenceQuestion,
	conceptScores,
}: {
	referenceAnswer: string;
	referenceQuestion: string;
	conceptScores: [string, number][];
}): Component => [
	Cls,
	Br,
	["primary", "(❀ˆᴗˆ) my translation is:"],
	["secondary underlined", referenceQuestion],
	["secondary underlined", referenceAnswer],
	Br,
	...conceptScores.map((
		[concept, score],
	) => [
		"tertiary",
		`${concept} ➤ ${Math.round(score * 100)}`,
	] as Line),
	Br,
];

const letterToFancy: Record<string, string> = {
	a: `🅰`,
	e: `🅴`,
	i: `🅸`,
	o: `🅾`,
	u: `🆄`,
	k: `🅺`,
	x: `🆇`,
	b: `🅱`,
	c: `🅴`,
	d: `🅳`,
	f: `🅵`,
	g: `🅶`,
	h: `🅷`,
	j: `🅹`,
	l: `🅻`,
	m: `🅼`,
	n: `🅽`,
	p: `🅿`,
	q: `🆁`,
	r: `🆁`,
	s: `🆂`,
	t: `🆃`,
	v: `🆅`,
	w: `🆆`,
	z: `🆉`,
	y: `🆈`
};

export const ShowPrompt = ({
	cue,
	hint,
	commands,
}: {
	cue: string;
	hint: string;
	commands: [string, string][];
}): Component => [
	Cls,
	Br,
	["tertiary", "try translating this sentence!"],
	["tertiary", "i believe in you ૮ ˶ᵔ ᵕ ᵔ˶ ა"],
	Br,
	["primary italic solid", `  ${cue}  `],
	Br,
	["primary 80", `♡♡ hint: ${hint}`],
	Br,
	...commands.map((cmd) =>
		[
			[`secondary bold`, `!${cmd[0]}`],
			[`secondary`, ` => `],
			[`secondary italic`, `${cmd[1]}`]
		] as Line
	),
	Br,
];
