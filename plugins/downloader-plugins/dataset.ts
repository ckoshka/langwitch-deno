import { Result } from "https://cdn.jsdelivr.net/gh/ckoshka/enums/mod.ts";
import { Int, int, Maybe, Ram, Rem, zod } from "../../plugins/deps.ts";
import { getArchive } from "./archive_org.ts";

export type Dataset = {
	source: string;
	ord: int;
	language: string;
	year: int;
	translator: string | null;
};

export type DatasetMeta = {
	bytes: number;
};

export const Dataset = {
	fromStr: (str: string): Maybe<Dataset> => {
		try {
			const parts = str.replace(".tsv", "").split("-");
			const language = parts[1];
			const source = parts[2];
			const ordLabel = parts[3];
			if (!ordLabel.includes("ord")) throw {};
			const ord = Int(Number(ordLabel.replace("ord", "")));

			const additional = parts[4];
			const [translator, year] = !isNaN(Number(additional))
				? [null, Int(Number(additional))]
				: [parts[4], Int(Number(parts[5]))];
			if (year === undefined) throw {};

			return Maybe.some({ source, ord, language, year, translator });
		} catch {
			return Maybe.none();
		}
	},
	toStr: (d: Dataset) => {
		return d.translator === null
			? `english-${d.language}-${d.source}-ord${d.ord}-${d.year}`
			: `english-${d.language}-${d.source}-ord${d.ord}-${d.translator}-${d.year}`;
	},
	validator: zod.object({
		source: zod.string(),
		ord: zod.number().int(),
		language: zod.string(),
		year: zod.number().int(),
		translator: zod.null().or(zod.string()),
	}),
	isA: (x: unknown): x is Dataset => {
		return Dataset.validator.safeParse(x).success;
	},
};

export const getDatasets = getArchive().map(
	Ram.map(Ram.pipe(Ram.prop("name"), Dataset.fromStr, (m) => m.get())),
)
	.map(Ram.filter((x) => x != null))
