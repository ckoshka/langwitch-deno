export type LanguageFieldNames = "front" | "back" | "tts";

export type LanguageMetadata = {
	words: string[];
	back: string;
	// name as a hint for what answer type is required?
	// i.e romanised, pinyin,
	front: string;
	tts: string;
};
