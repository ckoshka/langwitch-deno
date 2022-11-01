// commands:

import { Input, use } from "../deps.ts";
import { RunProcessEffect } from "../io_effects/effects.ts";

/*
- add a language
- review a specific language
- auto-mode, some kind of timer then quit the process automatically? scarcity, limited resource, creates desire
*/

export const timelimit = (secs: number) =>
	(cmd: string[]) =>
		use<RunProcessEffect>().map2(async (fx) => {
			const proc = fx.runProcess({ cmd, stdin: "inherit", stdout: "inherit" });
			await new Promise((resolve) => setTimeout(resolve, secs * 1000));
			proc.kill("SIGINT");
            console.log("hi");
            await Input.prompt("hi")
		});

timelimit(10)(
	`deno run -A --unstable plugins/context-plugins/implementors/tests/language.ts`
		.split(" "),
).run({
    runProcess: Deno.run
})
