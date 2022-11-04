import { SpeechReq, ttsClient } from "../../../../external-apis/clients/tts.ts";
import { LanguageMetadata } from "../../../context-types/mod.ts";
import { Message, State, use } from "../../../deps.ts";
import { GetMetadataEffect } from "../../../helpers/effects/metadata.ts";
import { ToProcess } from "../../message_types.ts";

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

export const implSpeak = (
	req: Omit<SpeechReq, "messages">,
	fx: AudioEffect,
): SpeakEffect => {
	const cache = new Map<string, Uint8Array>();
	return {
		runSpeak: async (s, speak) => {
			const previous = cache.get(s);
			if (previous) {
				speak ? fx.playAudio(previous) : {};
			} else {
				const result = await ttsClient.post({
					...req,
					messages: s,
				}).catch(() => new Uint8Array());
				if (speak) {
					fx.playAudio(result);
				}
				cache.set(s, result);
			}
		},
	};
};

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
