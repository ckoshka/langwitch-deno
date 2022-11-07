import { Component, Input } from "../../../deps.ts";
import { chroma, interpretComponent, themeColor } from "../../../deps.ts";

const theme = themeColor(
	chroma.scale(["blue", "purple", "magenta", "pink", "yellow"])
		.correctLightness(),
	0.58,
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
	palette: {
		accent: theme("cyan"),
		primary: theme("orange"),
		secondary: theme("purple"),
		neutral: theme("white"),
		base: theme("grey"),
		tertiary: theme("green"),
	},
});

export default {
	print: (s: Component) => console.log(style(s)),
	ask: (s: string | undefined) => Input.prompt(s || "best guess?"),
	random: Math.random
	//exit: () => Deno.exit(),
};
