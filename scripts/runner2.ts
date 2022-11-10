// env variable, folder, has executable binaries, type --help to get them, basic string similarity / synonym search, optional metadata alongside binary in yaml format
import yaml from "https://esm.sh/yaml";
import { LoggerEffect, use } from "../langwitch-shared-types/deps.ts";
import { colors } from "../plugins/deps.ts";
import {
	ensureDir,
	ReadDirectoryEffect,
	ReadEnvironmentalVariableEffect,
	ReadTextFileEffect,
} from "../plugins/io_effects/mod.ts";

type BinaryFilename = string;
type MetadataContents = string;
type BinariesInfo = Record<BinaryFilename, MetadataContents | null>;

export const getLocation = use<ReadEnvironmentalVariableEffect>().chain(
	(_, fx) => {
		const homeFolder = fx.readEnv("LANGWITCH_HOME_FOLDER") || "./lw";
		return ensureDir([homeFolder]);
	},
);

export const readFiles = (folder: string[]) =>
	use<ReadDirectoryEffect & ReadTextFileEffect>().map2(async (fx) => {
		const items: BinariesInfo = {};
		for await (const item of fx.readDir(folder[0])) {
			item.endsWith(".json")
				? items[item.replace(".json", "")] = await fx.readTextFile(
					item,
				)
				: items[item] = items[item] ?? null;
		}

		return items;
	});

export const displayBins = (items: BinariesInfo) =>
	use<LoggerEffect>().map2((fx) => {
		let data = "";
		data += "\n" + colors.dim.gray("----------");
		Object.entries(items).forEach(([k, v]) => {
			data += "\n" + colors.underline.green.bold(k) + "\n";
			data += "\n" + yaml.stringify(
				JSON.parse(v || `{"there's no metadata, sorry": ""}`),
			);
			data += "\n" + colors.dim.gray("----------");
		});
		fx.log(data);
	});
