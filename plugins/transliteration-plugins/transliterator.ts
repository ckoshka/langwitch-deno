import replace from "https://esm.sh/batch-replace@1.1.3";
//import { default as nlp } from "https://esm.sh/compromise@14.6.0";
//import plg from "https://esm.sh/compromise-speech@0.1.0";

export const reduce = (dict: Record<string, string>) => {
	const reducer = Object.keys(dict)
		.sort((a, b) => a.length - b.length)
		.filter((b) => b.normalize() != "" && dict[b].normalize() != "")
		.reduce((a, b) => {
			try {
				return a.and(new RegExp(b, "g")).with(dict[b]);
			} catch (e) {
				console.error(e);
				return a;
			}
		}, replace(/w3u0wifuwo4/).with("wf3ppfoiofwo"))
		.queue();
	return {
		transliterate: (text: string): string => {
			return reducer(text);
		},
	};
};