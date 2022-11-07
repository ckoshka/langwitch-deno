import { Client } from "./make_client.ts";

const example = {
    "orig": "う",
    "hira": "う",
    "kana": "ウ",
    "hepburn": "u",
    "kunrei": "u",
    "passport": "u"
};

export type JapaneseResponse = (typeof example)[];

export interface JapaneseReq {
	text: string;
}

export const japaneseClient = Client<JapaneseReq, JapaneseResponse>({
	after: (_, r) => r.json(),
	route: "/process_japanese/",
});