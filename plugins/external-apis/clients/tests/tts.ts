import { baseUrl } from "../consts.ts";
import { ttsClient } from "../tts.ts";

Deno.test({
	name: "test tts",
	fn: async () => {
		await ttsClient.post({
			messages: "Тэд буруу тасалгааны ургамал сонгосон байж болох уу?",
			voice: "mn-MN-YesuiNeural",
			pitch: "+0Hz",
			rate: "-15%",
			volume: "+15%",
		});
	},
});
