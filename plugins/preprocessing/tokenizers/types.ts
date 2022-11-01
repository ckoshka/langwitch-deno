export type TokenizeConfig = {
	granularity: "grapheme" | "word" | "sentence";
	locale?: string;
	filterIsWordLike: boolean;
};

export type TokenizeEffect = {
	tokenize: (s: string) => string[];
};
// separate this out into an effects module if it gets bigger
