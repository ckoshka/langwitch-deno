import { Maybe, Message, State, use } from "../../../../deps.ts";
import { SpeechReq, ttsClient } from "../../../../external-apis/clients/tts.ts";
import {
	GetMetadataEffect,
	LanguageMetadata,
	ToProcess,
} from "../../../../state-transformers/mod.ts";
import { Cache } from "../../../shared/cache.ts";

export type SpeakEffect = {
	runSpeak: (sentence: string, speak: boolean) => void;
};

export default (
	msg: Message<ToProcess, State>,
) => use<SpeakEffect & GetMetadataEffect<LanguageMetadata>>().map2((fx) => {
	const sentence = fx.getMetadata(msg.state.queue[0].id).back;
	fx.runSpeak(sentence, true);
	msg.state.queue.map((c) => c.id).map(fx.getMetadata).map((c) =>
		fx.runSpeak(c.back, false)
	);
	return msg;
});

export type AudioEffect = {
	playAudio: (audio: Uint8Array) => void;
};

// layer 2
export const implSpeak = (
	fx: AudioEffect & {
		$tts: Omit<SpeechReq, "messages">
	},
): SpeakEffect => {
	const cache = Cache<string, Maybe<Uint8Array>>({
		getter: (s: string) => ttsClient.post({
			...fx.$tts,
			messages: s,
		})
	});
	return {
		runSpeak: async (s, speak) => {
			const result = await cache.get(s);
			result.map(audio => {
				if (speak && audio.length !== 0) {
					fx.playAudio(audio);
				}
			});
		},
	};
};

// layer 1
// meaning mpvPath must be in layer 0
export const implAudio = ({ mpvPath }: { mpvPath: string }) => ({
	playAudio: async (audio: Uint8Array) => {
		const proc = Deno.run({
			cmd: [mpvPath, `--volume=83`, `-`],
			stdin: "piped",
			stdout: "null",
			stderr: "null",
		});
		await proc.stdin.write(audio);
		proc.stdin.close();
		await proc.status();
		proc.close();
	},
});

//await Deno.readFile(`/Users/ckoshka/programming/langwitch/plugins/context-plugins/implementors/addons/correct.mp3`).then(implAudio.playAudio);

//import Audio from "./correct.ts";

//implAudio.playAudio(Audio)

/*implSpeak({
	pitch: "+0Hz",
	rate: "+0%",
	voice: "ar-EG-SalmaNeural",
	volume: "+0%"
}, implAudio).runSpeak(`Macavity's the mystery cat, he's called the hidden paw`)*/
