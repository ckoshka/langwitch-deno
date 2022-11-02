import { int } from "../deps.ts";

export interface BaseContext {
	concepts: Array<string>;
	id: int;
	metadata: Map<string, string>;
}
// front: chinese characters
// back: pinyin
// chinese chars don't need a separate system, just a separate preproc step that inserts:
// radicals -> characters -> words, all held on the same concept-level.

// front: cyrillic
// back: transliteration?
// concept: grapheme
// context: word
// it would need to get the concepts from the front??
// so we need
// [ ] word -> graphemes, can do this with Intl
// [ ] a wordlist
// [ ] some way of hinting answers
// [ ] marking answers - this can be done the same way
// [ ] a method for doing this with scripts like Chinese or Japanese where radicals are involved

// hinting needs to be parameterised too
// control flow semantics like command-handlers will need to be either handled by the context...
// but then we have different extcontext implementations for different platforms i.e web, etc.
// so just the things relating to the metadata specifically.
// viewconfig will share stuff
// so it would need to be initialised with stuff like Config
