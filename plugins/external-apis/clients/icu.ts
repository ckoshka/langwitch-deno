import { Client } from "./make_client.ts";

export interface ICUReq {
	direction: string;
	sentence: string;
}

export const icuClient = Client<ICUReq, string>({
	after: (_, r) => r.json(),
	route: "/icu/",
});