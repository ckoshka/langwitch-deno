// What's L0?

// L0 provides two important functions:
// - nextConcepts
// 		This takes in the concepts you know, and returns what concepts should be learned next.
// - nextContexts
//		This takes in known concepts, and "focus" concepts (the ones you're learning currently) and returns every sentence that's suitable for learning from.

// instead of getting user to line them up, line them up ourselves and then export methods for modifying them?

// LW is organised like an onion of configuration layers.

// In L1, we start out with a very low-level configuration:
// - how to print things to the screen
// - how to ask the user for input
// etc.
// This is the place where you'd override things like the default theme.

/*const L1 = L1Config;

// L2 builds on L1. It mostly describes how to render higher-level components
// e.g displaying hints, what instruction to display, etc.
// This is where you'd override something like how the hinting works, or what commands are displayed.

const L2 = await createL2Config(L1.get());

// L3 is the highest level. It describes LW's control-flow:
// e.g quiz -> mark the answer
// mark the answer -> process the scores
// etc.
// Here, you'd be adding new commands, running side-effects like text-to-speech, and so on.

const L3 = LangwitchMachineWithDefaultCommands.get();

await initialiseLangwitch(L3).run({
	...L0.get(),
	...L1.get(),
	...L2.get(),
});

// Lastly, we initialise LW and run it using layers 1, 2, and 3.
// In the next example, I'll show examples for how to override this basic configuration.
*/