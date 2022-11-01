import { AsyncGen, BaseContext, int, Maybe, Rem } from "../deps.ts";

type ColumnNumber = number;

// temporary hack until the base context is resolved correctly

export type ColumnarConfig<FieldNames extends string, MetadataType> = {
	separator: string;
	postprocessors: Partial<Record<FieldNames, (s: string) => string>>;
	// what post-processing to do on *all* of the columns, i.e removal of quotation marks or escaped characters
	mappings: Record<FieldNames, ColumnNumber>;
	backupMappings: Partial<Record<FieldNames, ColumnNumber>>;
	// i.e if the field isn't present, then just duplicate from this other field
	defaultMappings: Partial<Record<FieldNames, string>>;
	// i.e if there's no backup, and the field isn't there, just use this default value
	toConcepts: (rec: Map<FieldNames, string>) => string[];
	toMeta: (rec: Map<FieldNames, string>) => MetadataType;
	isValidFastCheck: (s: string) => boolean;
};

const getFields = <FieldNames extends string, MetadataType>(
	cf: ColumnarConfig<FieldNames, MetadataType>,
) =>
(ln: string) => {
	const parts = ln.split(cf.separator);
	const map = Object.entries<number>(cf.mappings)
		.map(([key, colNumber]) => [
			key,
			parts[colNumber] ||
			parts[cf.backupMappings[key as FieldNames] as number] ||
			cf.defaultMappings[key as FieldNames],
		])
		.map(([key, value]) =>
			cf.postprocessors[key as FieldNames] && value
				? [key, cf.postprocessors[key as FieldNames]!(value)]
				: [key, value]
		)
		.reduce(
			(prev, next) => prev.set(next[0] as FieldNames, next[1]),
			new Map() as Map<FieldNames, string | undefined>,
		);
	return Array.from(map.keys()).some((k) => map.get(k) === undefined)
		? Maybe.none()
		: Maybe.some(map as Map<FieldNames, string>);
};

export const processLines = <FieldNames extends string, MetadataType>(
	cf: ColumnarConfig<FieldNames, MetadataType>,
) =>
(lines: AsyncIterableIterator<string>) =>
	Rem.pipe(
		lines,
		AsyncGen.enumerate,
		AsyncGen.map(([lineNumber, line]) =>
			!cf.isValidFastCheck(line)
				? Maybe.none()
				: getFields(cf)(line).map((data) => ({
					metadata: cf.toMeta(data),
					concepts: Array.from(new Set(cf.toConcepts(data))),
					id: lineNumber as int,
				}))
		),
		AsyncGen.fold(
			[] as (BaseContext & { metadata: MetadataType })[],
			(acc, m) => {
				m.map((fn) => (acc.push(fn)));
				return acc;
			},
		),
	);

export const processLine = <FieldNames extends string, MetadataType>(
	cf: ColumnarConfig<FieldNames, MetadataType>,
) =>
(lineNumber: int, line: string) =>
	!cf.isValidFastCheck(line) ? Maybe.none() : getFields(cf)(line).map(
		(data) => (<BaseContext & { metadata: MetadataType }> {
			metadata: cf.toMeta(data),
			concepts: Array.from(new Set(cf.toConcepts(data))),
			id: lineNumber as int,
		}),
	);
