// having symbols rather than strings, benefits and downsides? less ambiguity, no "as const" bullshit
// permits user-defined types and expansions
// verb aspect? present, continue, future (await), past?
// takes a specific io-state and returns a new one?
// what steps do we have?

import { ConceptName, Score, State } from "../deps.ts";
import { zod } from "./deps.ts";

/*
- show prompt
- get answer
- show feedback
- interpret commands like, show hints, mark as known, etc.
- decide on the next state...

so we have a single top-level fn that use<SomeFx> state<A> => state<B>
and then we have a sorta routing fn that passes the state into those fns, gets the symbol back, etc.
now instead of a linear sandwich loop which makes handling new dynamics (i.e hinting) impossible, we have a graph.
and we can have different enum record variants with different data, but they all share one thing in common: {symbol: string}

but this doesn't easily allow for adding new phases
if there are two things that both take State<A>, then run whichever one returns back State<A> vs the one that returns State<B>
if it's returning back the same state then it's pretty much just saying "run this purely for its side effects"
some functions might return a state or might return nothing depending on whether the ctx type matches (i.e if we have an audio ctx and a text ctx that need to be marked separately, the audio marker will just return immediately if it's a text ctx)

or it could declare what next state it needs, and then it takes a record of {fn: fn} that it calls inside the body
so instead of directly handling and labelling it says "I need a nextState handler with this particular interface accepting this data"
and at the end, we just... run it as a Free? but then... the handlers can't also be the effects themselves, right?

the ideal case would be:
- each module exports a FX State => (...stuff)
- those fx are other state handlers
- we start off with a top-level state, it invokes the others, all of them have a return signature of never
- they return the actual effect function itself so it can be called in a big loop
 if they all have a return signature of never, then really all we need to return is the actual data. this avoids tangled dependencies.
 this is a nice model: we just have a single function that takes an input (statelessly?) and returns an output. needs to be named.
 since the server fn is quite declarative, we could easily just take the same zod-routing style and apply it here
 it would also avoid binding us to a particular type-signature
 if we have dependencies then we can use effects
 () -> stuff
 to avoid recursion depth
 */

export const ToMark = zod.object({
	answer: zod.string(),
});

export const ToProcess = zod.object({
	results: zod.array(zod.tuple([zod.string(), zod.number().min(0).max(1)])),
});

export const ToAsk = zod.object({
	next: zod.string(),
	msg: zod.string(),
});

export type ToMark = zod.infer<typeof ToMark>;
export type ToAsk = zod.infer<typeof ToAsk>;
export type ToProcess = zod.infer<typeof ToProcess>;
