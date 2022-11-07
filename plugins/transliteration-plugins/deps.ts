
export * from "../external-apis/clients/wiktra.ts";
export * from "../external-apis/clients/pinyin.ts";
export * from "../external-apis/clients/phonemize.ts";
export * from "../external-apis/clients/japanese.ts";
export * from "../external-apis/clients/icu.ts";
export * from "../external-apis/clients/epitran.ts";

export { default as WiktraTable } from "../external-apis/tables/data/wiktra_table.ts";
export { default as EpitranTable } from "../external-apis/tables/data/epitran_table.ts";
export { default as ICUTable } from "../external-apis/tables/data/icu_table.ts";

// ok, so there's a challenge
// 1. testing - does it actually work for the language code we want? try various inputs
// 2. initialisation - the effect signatures for map are synchronous.
// 2a. this means we need to prepare and cache the results, which adds to boot latency.
// 2b. which means the construction of a map effect has to occur while the backend is being initialised, and while the contexts are being created, or it has to occur while the user is still answering (preinvocation hook), and applied to the whole queue. 
// 2c. which means there's a possibility the transliteration mightn't have loaded yet

// core problems: requires mutability, requires execution of async side eff., fallible operation
// how do we usually handle this?
// 1. localise the mutability, encapsulate it within a closure-object
// 2. represent failure-states via Maybe<T>
// the question is, how do we signal to the user that something failed?
// SN: we need failures to be identifiable by the extension
// annotated functions?

// the tradeoff is: 
// - do we increase boot time -> more likely everything has loaded
// - or decrease boot time -> at the expense of more failures

// centralised caching (mutable Map) or localised thunks?
// let's go with thunks

// or, alternatively, transliterate the entire deck beforehand (not feasible in many cases, inefficient on data & compute)

// is calling into the lua runtime for wiktra multithreaded or blocking?

// strategy: thunk-cache ahead
// what layer? it would have to be layer 0 since transliteration occurs in layer 1