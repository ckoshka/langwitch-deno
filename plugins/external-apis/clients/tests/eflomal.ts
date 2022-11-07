import { baseUrl } from "../consts.ts";
import { alignerClient, preAlignmentFilter } from "../eflomal.ts";

Deno.test({
	name: "test tts",
	fn: async () => {
		await alignerClient.post(preAlignmentFilter({
			sentences: [[
				"This is a pancake and this is a cake.",
				"Diese est une pankakke und diese est une kake",
			]],
			direction: [0, 1],
			preprocess: true,
		}));
	},
});
