import { startLangwitch } from "../language.ts";

await startLangwitch({
	init: {
		conceptsFile: `langwitch-home/concepts/venetian.json`,
		sentencesFiles: [`langwitch-home/data/venetian`],
		binariesFolder:
			`/Users/ckoshka/programming/rust-experiments/everything/target/release`,
	},
	1: (cfg) =>
		cfg.modify((cfg) => {
			cfg.$params.maxLearnable = 5;
			// maxLearnable places a soft-cap on the number of new words lw can make you juggle at a time
			// notes:
			// - placing it as 0 should theoretically put you into a review-only mode, though I haven't tested this
			// - setting it too low can cause lw to fail to find any sentences reviewing those specific words
			// - setting it higher makes the psychological pace of sessions feel proportionally slower because each word has a longer 'turnover' rate

			

			cfg.$params.artificialKnownnessFactor = 2;
			// this controls how strong the "knownness" command is. 
			// higher means words marked as known will be treated like you've known them for years rather than weeks
			cfg.$params.fractionDiscardOldContexts = 0.5;
			// when new words are introduced, old contexts with old words get booted out to keep the queue fresh
			// setting this lower can cause contexts to keep accumulating, slowing down sessions, but it means lw will occasionally revisit older words
			// setting this higher will decrease the diversity of sentences you're exposed to, but emphasise new words more strongly

			cfg.$params.maxConsiderationSize = 35;
			// lw by default considers 35 possible words to introduce, and picks only a couple of them each time based on criteria like how easy they are to confuse for one another or how difficult they are to remember
			// generally try to avoid modifying this one
			cfg.$params.$contexts.topFractionContextRandomisation = 0.3;
			// after each answer, every sentence / context is ranked by how 'optimal' it is.
			// the optimality algorithm by default maximises futurity - 
			// i.e it simulates what would happen to the concept's half-life if you were to answer correctly for it, and chooses whichever context extends the lifespan of your known concepts the most
			// setting this lower means more "optimal", but also much more repetition because it's a local optimiser not a global one.
			cfg.$params.$contexts.lengthPenaltyLog = 0.27
			// say a context has 10 concepts and nailing it will advance the concepts it contains by 100 days in total. the default algorithm divides those 100 days by 10 concepts and so its futurity score becomes 10 days. 
			// this penalises longer sentences (because they're more 'dilute'), which isn't always what we want.
			// set this higher if you prefer shorter sentences, setting it lower will mean longer sentences.
			// moving it too much in either direction makes sessions more repetitive.
			cfg.$params.$contexts.probabilityRandomShuffle = 0.5;
			// this determines how likely the top contexts are to be shuffled slightly

			// the parameters after this have very unpredictable effects when modified, and were chosen by a genetic algorithm. lw is quite resilient to tampering, but these ones are relatively dangerous to modify compared to the others.

			cfg.$params.initialDecay = -0.501;
			// this models how good your memory is after seeing a word exactly once, i.e how quickly the concept is estimated to decay
			// changing it to -0.7 means lw will show you the word 6 times instead of just 3
			// changing it to lower than -0.4 means lw will show you the word only once or twice
			cfg.$params.flexibility = 0.0954;
			// this models how much lw will adjust to each of your answers
			// it adds tolerance for getting a word unexpectedly wrong once or twice
			// increasing it without increasing initialDecay will mean words only get shown once or twice, because each time you score 100 on a word, lw will adjust upwards too quickly
			// you might want to increase it if you want lw to be less tolerant of mistakes
			// or decrease it if you make mistakes by accident more often
			cfg.readLogBase = 1.16285;
			// actually this one can be modified fairly safely.
			// it represents how fast your memory decays, and tends to vary a lot between different people. increasing = higher decay. decreasing = lower decay
			// if lw starts off a session by making you review older words first and you already know them, try decreasing this to 1.1, 1.03 at the very least
			// if lw's hints are too incomplete, that usually means she thinks you already know the word well. if this happens often, you can safely increase it to around 1.45.
		}),
});
