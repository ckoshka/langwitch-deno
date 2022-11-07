import { Client } from "./make_client.ts";

export interface PhonemizeReq {
	text: string[];
	language: string;
}
export const phonemizeClient = Client<PhonemizeReq, string>({
	after: (_, r) => r.json(),
	route: "/phonemize/",
});
