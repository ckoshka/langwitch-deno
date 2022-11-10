// How to: choose a different theme

import { addCommands, startLangwitch } from "https://raw.githubusercontent.com/ckoshka/langwitch-deno/master/plugins/configs/language.ts";

// We need three more imports this time
import { chroma, interpretComponent, themeColor } from "https://raw.githubusercontent.com/ckoshka/langwitch-deno/master/plugins/deps.ts";
// chroma is a library for playing around with colours
// interpretComponent asks what palette you want
// themeColor can add more visual cohesion to that palette

const defaultTheme = themeColor(
	chroma.scale(["blue", "purple", "magenta", "pink", "yellow"])
		.correctLightness(),
	// "make the darkest colours bluer, the middling colours magentier, and the lightest colours yellower"
	0.58,
	// "mix it so it's half from the original colour, half from the new scale"
);

const theme = themeColor(
	chroma.scale(["#00ff00", "#0000ff"])
		.correctLightness(),
	// hex codes work as well
	0.4,
	// you have to play around with the themes quite a lot to get something that isn't ugly
);

export const style = interpretComponent({
	borders: {
		dotted: {
			vert: "•",
			horiz: "•",
		},
		solid: {
			vert: "|",
			horiz: "—",
		},
	},
	// this should be self-explanatory
	palette: {
		primary: theme("cyan"),
		secondary: theme("yellow"),
		tertiary: theme("indigo"),
		accent: theme("green"),
		neutral: theme("purple"),
		base: theme("red"),
	},
	// i'm thinking of phasing out the palette thing, but it does have the benefit of keeping themes consistent
	// aesthetics are very important to me
});

await startLangwitch({
	init: {
		conceptsFile: `langwitch-home/concepts/venetian.json`,
		sentencesFiles: [`langwitch-home/data/venetian`],
		binariesFolder:
			`/Users/ckoshka/programming/rust-experiments/everything/target/release`,
	},
	1: (cfg) => cfg.revise({
		print: c => console.log(style(c))
	})
});
