import {
	ColumnarConfig,
	decapitalize,
	Revisable,
	revisable,
} from "../../deps.ts";

export type FieldNames = "span" | "keywords";

export type MetadataType = {
	keywords: string[];
	span: string;
};

export const defaultConfig = revisable({
	separator: "\t",
	postprocessors: {
		span: decapitalize,
	},
	mappings: {
		span: 0,
		keywords: 1,
	},
	backupMappings: {},
	defaultMappings: {},
	toConcepts: (m) => m.get("keywords")!.split(","),
	toMeta: (rec) => ({
		keywords: rec.get("keywords")!.split(","),
		span: rec.get("span"),
	}),
	isValidFastCheck: (s) => s.split("\t").at(1) != "",
}) as Revisable<ColumnarConfig<FieldNames, MetadataType>>;
