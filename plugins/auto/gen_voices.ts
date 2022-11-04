import { ttsClient } from "../external-apis/clients/tts.ts";

ttsClient.post({
	messages: "",
	pitch: "+0Hz",
	rate: "-25%",
	voice: "am-ET-MekdesNeural",
	volume: "+10%",
});

// 1. reprocess the table
// 2. create a set from sentences
// collapse down repetition
