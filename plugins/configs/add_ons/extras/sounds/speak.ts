import { Maybe, Message, State, use } from "../../../../deps.ts";
import { SpeechReq, ttsClient } from "../../../../external-apis/clients/tts.ts";
import {
	GetMetadataEffect,
	LanguageMetadata,
	ToProcess,
} from "../../../../state-transformers/mod.ts";
import { Cache } from "../../../shared/cache.ts";
import { isLanguageMetadata } from "../../../shared/mod.ts";

export type SpeakEffect = {
	runSpeak: (data: SpeechReq, speak: boolean) => void;
};

export default (req: Omit<SpeechReq, "messages">) => use<SpeakEffect>().map2((fx) =>
	async (
		msg: Message<ToProcess, State>,
	) => {
		const meta = msg.state.queue[0].metadata;
		if (isLanguageMetadata(meta)) {
			fx.runSpeak({messages: meta.tts, ...req}, true);
			// cache
			for (const ctx of msg.state.queue) {
				const meta2 = ctx.metadata;
				if (isLanguageMetadata(meta2)) fx.runSpeak({messages: meta2.tts, ...req}, false);
			}
		}
		return msg;
	}
);

export type AudioEffect = {
	playAudio: (audio: Uint8Array) => void;
};

// layer 2
export const implSpeak = (
	fx: AudioEffect
): SpeakEffect => {
	const cache = Cache<SpeechReq, Maybe<Uint8Array>>({
		getter: (s: SpeechReq) =>
			ttsClient.post(s),
	});
	return {
		runSpeak: async (s, speak) => {
			const result = await cache.get(s);
			result.map((audio) => {
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
			cmd: [mpvPath, `--volume=75`, `-`],
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
