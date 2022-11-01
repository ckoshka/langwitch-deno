import { Client } from "./make_client.ts";

// { "messages": "string", "voice": "Microsoft Server Speech Text to Speech Voice (en-US, AriaNeural)", "pitch": "+0Hz", "rate": "+0%", "volume": "+0%" }
type Name = string;
type CountryCode = string;
type LanguageCode = string;

export type Pitch = `${"+" | "-"}${number}Hz`;
export type Rate = `${"+" | "-"}${number}%`;
export type Volume = `${"+" | "-"}${number}%`;
export type Voice = `${LanguageCode}-${CountryCode}-${Name}Neural`;

export interface SpeechReq {
	messages: string;
	voice: Voice;
	pitch: Pitch;
	rate: Rate;
	volume: Volume;
}

export const ttsClient = Client<SpeechReq, Uint8Array>({
	after: (_, r) => r.arrayBuffer().then((a) => new Uint8Array(a)),
	route: "/tts/",
});

/*
await new Command()
	.name("tts")
	.version("0.1.0")
	.description("Text to speech for 76 different languages")
	//.option("-f, --file", "Write the output to a file", {
	//	default: false,
	//})
	.option("-s, --say [speak:boolean]", "Play the output", {
		default: true,
	})
	.option("-p, --pitch <pitch:string>", "The pitch of the voice", {
		default: "+0Hz",
	})
	.option("-r, --rate <rate:string>", "The rate of the voice", {
		default: "-25%",
	})
	.option("-v, --volume <volume:string>", "The volume of the voice", {
		default: "+0%",
	})
	.option("-d, --directory <directory:string>", "The directory to save to", {
		required: true,
	})
	.arguments("<language:string> <message:string>")
	.action(async ({ say, pitch, rate, volume, directory }, language, message) => {
		const voice = search.search(language)[0].item["Voice name"];
		const fname = `${directory}/${message}.${voice}.mp3`;

		console.log(`Using ${voice}`);

		if (!(await exists(fname))) {
			try {
				await Deno.mkdir(directory);
			} catch {
				//
			}
			const r = await client(
				`https://wiktra-attempt-4.glossandra.repl.co`,
			).post({
				messages: message,
				voice,
				pitch: pitch,
				rate: rate,
				volume: volume,
			}); // if 0 length throw err

			await Deno.writeFile(fname, r);
		}
		const r = await Deno.readFile(fname);
		if (say) await speak(r).run();
	})
	.parse(Deno.args);
*/
// could tokenise, then consume?
