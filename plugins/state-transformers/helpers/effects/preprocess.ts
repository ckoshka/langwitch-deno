export type UnprocessedString = string & { __unproc: never };
export type ProcessedString = string & { __proc: never };

export type PreMarkingProcessingEffect = {
	preprocess: (
		s: UnprocessedString | ProcessedString | string,
	) => ProcessedString;
};
