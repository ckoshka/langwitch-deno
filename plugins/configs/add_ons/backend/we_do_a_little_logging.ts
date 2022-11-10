import { DiffLogger, prettify, Ram, revisable, State } from "../../../deps.ts";

export default (logFile = "logs.langwitch.txt") => {
	const loggingFn = Ram.pipe(
		prettify("app"),
		(line) => Deno.writeTextFile(logFile, line + "\n", { append: true }),
	);
	const Logger = DiffLogger({
		writeDiffs: loggingFn,
	})({});
	return (state: State) => {
		Logger.update(revisable(state).delete("queue").contents);
	};
};
