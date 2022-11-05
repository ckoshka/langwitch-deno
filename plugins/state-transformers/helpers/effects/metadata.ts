import { int } from "../../deps.ts";

export type GetMetadataEffect<Meta> = {
	getMetadata: (id: int) => Meta;
};
// archived