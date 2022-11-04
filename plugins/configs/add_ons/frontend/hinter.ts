import { hiderFromMsgpackUrl } from "../../../deps.ts";

export default {
	hider: await hiderFromMsgpackUrl(
		`https://github.com/ckoshka/langwitch_hider/raw/master/assets/frequency_table.msgpack`,
	),
};
