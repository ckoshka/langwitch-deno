import { TokenizeConfig, TokenizeEffect } from "./types.ts";

export const tokenize = ({
	granularity,
	locale,
	filterIsWordLike,
}: TokenizeConfig) => {
	const segmenter = new Intl.Segmenter(locale, { granularity: granularity });

	return (s: string) => {
		const decapitalised = decapitalize(s);
		return [...segmenter.segment(decapitalised)]
			.filter((c) => (filterIsWordLike ? c.isWordLike : true))
			.map((c) => c.segment);
	};
};

export const decapitalize = (s: string) =>
	s[0] ? s[0].toLowerCase().concat(s.slice(1)) : s;

export const implTokenize = (): TokenizeEffect => ({
	tokenize: tokenize({ filterIsWordLike: true, granularity: "word" }),
});

export const implGraphemeTokenize = (): TokenizeEffect => ({
	tokenize: tokenize({ filterIsWordLike: false, granularity: "grapheme" }),
});
