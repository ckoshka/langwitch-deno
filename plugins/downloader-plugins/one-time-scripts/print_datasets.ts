import { getDatasets } from "../dataset.ts";

getDatasets.map((dxs) => JSON.stringify(dxs)).map((dxs) => console.log(dxs))
	.run({
		fetch,
	}).then(() => Deno.exit());
