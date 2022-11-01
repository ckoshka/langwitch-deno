import { Client } from "./make_client.ts";
// API2
// { "direction": "ru-Latn", "sentence": "я говорю по-португальски" }
// returns a single transliterated string

interface WiktraReq {
	source_language_code: string;
	text: string;
}

export const wiktraClient = Client<WiktraReq, string>({
	after: (_, r) => r.json(),
	route: "/wiktra/",
});
