export type MapUserAnswerEffect = {
	mapUserAnswer: (sentence: string) => string;
};

export type MapShownAnswerEffect = {
	mapShownAnswer: (sentence: string) => string;
};

export type MapHintEffect = {
	mapHint: (words: string[]) => string[];
};

export type MapReferenceAnswerEffect = {
	mapReferenceAnswer: (word: string) => string;
};

const id = <T>(x: T) => x;

export const implStringMappings:
	& MapUserAnswerEffect
	& MapShownAnswerEffect
	& MapHintEffect
	& MapReferenceAnswerEffect = {
		mapReferenceAnswer: id,
		mapHint: id,
		mapShownAnswer: id,
		mapUserAnswer: id,
	};

// this would almost certainly be a L1 thing, because the higher-level effects depend on them.
// these two are heavily co-dependent, bcs we don't want the hint to be different from the shown answer

// mapping the reference words would really be part of the marker? otherwise we're tying ourselves down to a specific representation.
// is it theoretically possible to serialise the entire state of the application including the loaded contexts?
// in that case we could eliminate boot-wait entirely.
// it can't be asynchronous, so we need to cache it somehow...
// so long as the latency is low enough?
