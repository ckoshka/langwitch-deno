import {
	CommandOutputEffect,
	CreateDirectoryEffect,
	FileExistsEffect,
	ReadTextFileEffect,
	RemoveFileEffect,
	TempFileEffect,
	WriteTextFileEffect,
} from "./effects.ts";
import { Dax, ReadFileEffect, run, use } from "./deps.ts";

export const implFileExists: FileExistsEffect = {
	fileExists: (f) => Deno.stat(f).then(() => true).catch(() => false),
};

export const implTempFile: TempFileEffect = {
	createTempFile: async (data: string) => {
		const filename = await Deno.makeTempFile();
		await Deno.writeTextFile(
			filename,
			data,
		);
		return filename;
	},
};

export const implReadFile: ReadFileEffect<Promise<string>> = {
	readFile: (name: string) => Deno.readTextFile(name),
};

export const implRemoveFile: RemoveFileEffect = {
	removeFile: (f) => Deno.remove(f),
};

export const implWriteTextFile: WriteTextFileEffect = {
	writeTextFile: (f, c) => Deno.writeTextFile(f, c),
};

export const implReadTextFile: ReadTextFileEffect = {
	readTextFile: (f) => Deno.readTextFile(f),
};

export const implMakeDir: CreateDirectoryEffect = {
	mkdir: (f) => Deno.mkdir(f),
};

const createCmdChain = (_cmds: string[]) => {
	const cmds = [..._cmds];
	const task = cmds.slice(1).reduce(
		(t, c) => t.run(c),
		run(cmds.at(-1)!, { stdout: "piped", stderr: "null" }),
	);
	return task;
};

export const implCommandOutput: CommandOutputEffect = {
	getIterFromCmds: (_cmds: string[]) =>
		(async function* () {
			yield* createCmdChain(_cmds).toIterable();
		})(),
	runCmds: async (_cmds: string[]) => {
		const cmd = _cmds.join(" | ");
		console.error(`Executing: ${cmd}`);
		const file = await Deno.makeTempFile();
		await Deno.writeTextFile(file, cmd);
		try {
			await Dax`bash ${file}`.noThrow().quiet();
		} finally {
			await Deno.remove(file);
		}
	},
};

export const ensureDir = (paths: string[]) =>
	use<CreateDirectoryEffect>().map2(async (fx) => {
		await Promise.all(paths.map((path) => fx.mkdir(path).catch((_) => {})));
		return paths;
	});

export const implFileSystem = {
	...implCommandOutput,
	...implWriteTextFile,
	...implRemoveFile,
	...implTempFile,
	...implFileExists,
	...implReadFile,
	...implReadTextFile,
	...implMakeDir,
};
