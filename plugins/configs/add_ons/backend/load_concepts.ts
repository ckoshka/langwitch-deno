import { Concept, makeRecord, Rem } from "../../../deps.ts";
import { fromEnv } from "../../shared/mod.ts";

export default (conceptsFilename: string) => ({
	loadConcepts: () =>
		Deno.readTextFile(conceptsFilename)
			.then(JSON.parse)
			.then(Rem.filter((c: Concept) => c.timesSeen > 3))
			.then(makeRecord((c) => c.name)),
});
