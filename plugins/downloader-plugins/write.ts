import { Async, join, NetEffect, use, WriteFileEffect } from "./deps.ts";
import { CommandOutputEffect } from "../io_effects/mod.ts";

export type CacherArgs = {
	outputFolder: string;
	url: string;
	name: string;
};

export type CurlEffect = {
	curlBinaryPath: string;
};

export const getFile = (args: CacherArgs) =>
	use<CommandOutputEffect & CurlEffect>()
		.map(async (r, fx) => {
			const path = join(args.outputFolder, args.name);
			await fx.runCmds([
				`${fx.curlBinaryPath} -sLk ${args.url} | head -n 1000000 > ${path}`,
			]);

			return path;
		});
