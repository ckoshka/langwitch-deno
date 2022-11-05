import { isMatching, P } from "../../deps.ts";

export const isLanguageMetadata = isMatching({
	front: P.string,
	back: P.string,
	words: P.array(P.string),
	tts: P.string
});
