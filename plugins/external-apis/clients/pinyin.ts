import { Client } from "./make_client.ts";

export interface PinyinReq {
	chars: string;
	splitter: string;
    tone_marks: "marks" | "numbers"
}

export const pinyinClient = Client<PinyinReq, string>({
	after: (_, r) => r.json(),
	route: "/get_pinyin/",
});
