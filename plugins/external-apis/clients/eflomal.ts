import { Client } from "./make_client.ts";

interface AlignmentReq {
	sentences: [string, string][];
	direction: [0, 1] | [1, 0];
	preprocess: boolean;
}

export type WordPosition = number & { ___wordPosition: never };

export const preAlignmentFilter = (data: AlignmentReq) => {
	const seg = new Intl.Segmenter(undefined, { granularity: "word" });
	return {
		text: data.sentences.filter((sxs) =>
			sxs[data.direction[0]] && sxs[data.direction[1]] &&
			sxs[data.direction[0]].length > 7 &&
			sxs[data.direction[1]].length > 7
		).map((sxs) =>
			[sxs[data.direction[0]], sxs[data.direction[1]]].map((s) => {
				if (data.preprocess) {
					return [...seg.segment(s.toLowerCase())].filter((x) =>
						x.isWordLike
					)
						.map(
							(x) => x.segment,
						)
						.filter((x) => !/\d/.test(x))
						.join(" ");
				}
				return s;
			}).join(" ||| ")
		).filter((s) => s.includes(" ||| ")).join("\n"),
	};
};

export const alignerClient = Client<{ text: string }, string>({
	route: "/align_text/",
	after: async (_, resp) => {
		const text: string = await resp.json();
		//console.log(text);
		return text;
	},
});
