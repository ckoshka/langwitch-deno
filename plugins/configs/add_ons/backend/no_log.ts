import { State } from "../../../deps.ts";

export default {
	log: (data: State) => {},
	tap: (additionalMsg?: string) => <T>(data: T) => data,
};
