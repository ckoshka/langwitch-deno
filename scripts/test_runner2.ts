import { assertEquals } from "https://deno.land/std@0.144.0/testing/asserts.ts";
import { getLocation,readFiles,displayBins } from "./runner2.ts";

Deno.test({
	name: "test runner",
	fn: async () => {
		const result = await new Promise((resolve) =>
			getLocation.chain(readFiles).chain(displayBins).run({
				log: resolve,
				mkdir: async () => {},
				readDir: async function* () {
					yield "bar";
					yield "bar.json";
				},
				readEnv: () => "testing",
				readTextFile: async (filename) => {
					return `{
                    "foo": [1, 2, 3]
                }`;
				},
			})
		);
		assertEquals(
			result,
			"\n\u001b[90m\u001b[2m----------\u001b[22m\u001b[39m\n\u001b[1m\u001b[32m\u001b[4mbar\u001b[24m\u001b[39m\u001b[22m\n\nfoo:\n  - 1\n  - 2\n  - 3\n\n\u001b[90m\u001b[2m----------\u001b[22m\u001b[39m",
		);
	},
});
