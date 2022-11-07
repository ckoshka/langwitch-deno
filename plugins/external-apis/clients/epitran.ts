import { Client } from "./make_client.ts";

export interface EpitranReq {
	sentence: string;
	script: string;
}

export const epitranClient = Client<EpitranReq, string>({
	after: (_, r) => r.json(),
	route: "/epitran/",
});