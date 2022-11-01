// we want it to be flattened.

import { Machine, State } from "../deps.ts";
import {
	Ask,
	Ding,
	Exit,
	Feedback,
	Known,
	LanguageFeedback,
	LanguageQuiz,
	LanguageMarker,
	NextState,
	Quiz,
	Save,
	Skip,
	Speak,
	Stats,
	Timelimit,
} from "../context-plugins/mod.ts";

const cfg = {
    // Short for configuration
    // This is the folder where the Rust binaries are stored. They are used when Javascript is too slow.
	binariesFolder:
		`/Users/ckoshka/programming/bash_experiments/showcase/target/release`,
    // This is where Langwitch will try and look up your concepts and data from.
	homeFolder: `ckoshka-personal`,
	languageName: "silesian",
	voiceName: `pt-BR-BrendaNeural`,
};

let machine = Machine<State>()
    // A machine is made of some parts. Those parts can be normal, or they can be effectful – i.e they need some extra things to work, like being able to print to the screen or play audio. The machine keeps track of those extra things and lets us provide them at the very end.

	.add(
		Quiz
            // Quiz shows you the front of the flashcard. It's empty, so you need to add things:
			.beforeF(LanguageQuiz),
            // We add LanguageQuiz because we're studying a language on the command-line. 
            // ~ It wants to be able to:
            // - print to the screen
	)
	.add(
		Ask
            // Ask asks you for input.
			.afterF(Exit)
            // Then it checks if you want to exit
            // ~ It wants to be able to:
            // - halt Langwitch completely
            // - save your concepts
			.afterF(Known)
            // Then it checks if you want to mark it as known
            // ~ It wants to be able to:
            // - ask us how 'known' we want it to be marked as
            // i.e do we want it to be as if we've known it for a whole year, or just a few days?
			.after(Skip),
            // Skip is an ordinary function and it doesn't need anything. It just gets rid of the first flashcard in the queue if you think it sucks.
	)
	.add(
		LanguageMarker
            // Mark wants you to give it a marking function.
            // i.e do you want to compare the letters to see how close your answer is? or do you want to convert your answer first, maybe from hanzi to pinyin before marking?
			.afterF(Ding),
            // This adds a light chime after you answer questions. It's nice for getting into the rhythm but like anything else here, it can be removed.
            // ~ It wants to be able to:
            // - play audio
            // This is quite hard on some people's computers! That's why we use mpv, which is a music player, further down.
	)
    .add(
		Feedback
            // Feedback is another empty part that does nothing. It's meant to show you what your scores were for each concept.
            // i.e word1 - 98, word2 - 75, word3 - 100, word4 - 0
			.beforeF(Speak)
            // Speak uses the same effects as Ding, but it uses them to speak the sentence you just reviewed out loud.
			.beforeF(LanguageFeedback)
            // This is the part that shows you feedback for specific words.
			.afterF(
				Timelimit({ maxMinutes: 3.5 }),
			),
            // And this one checks to see if you've been playing Langwitch for longer than 3.5 minutes. It stops you from wearing your brain out and tells you when to take a break, but you can remove it if you want.
            // ~ It wants to be able to:
            // - measure how many minutes have passed
	)
	.add(
		NextState
            // Lastly, we have the real meat and potatoes of this whole shebang. So far, each of the parts have been passing an object around called State.
            // State has a couple of things inside it, like what words you know and what words you're still learning.
            // NextState simply takes in your scores, decides how well you know the concepts, and calculates the next state.
			.afterF(Stats<null>())
            // After the state is done being calculated, it shows you some useful statistics.
			.afterF(Save),
            // And saves your session :)
	);

// demonstrate adding a new phase plugin

// if we're loading scripts, then we need to either have the side effects be self-contained, or restrict them to a specific set.
// can we speed up contexts?