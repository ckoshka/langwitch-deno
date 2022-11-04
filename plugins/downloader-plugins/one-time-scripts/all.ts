import { implCommandOutput } from "../../io_effects/mod.ts";
import { createFilter, getArchive } from "../archive_org.ts";

const noShitty = createFilter([`tatoeba_aggregated`, `5grams`, "bible"], [
	".tsv",
]);

const tsvs = await getArchive().map((xs) =>
	xs.filter((x) =>
		noShitty(
			x.name,
		)
	)
).run({ fetch });

const languages = new Set(tsvs.map((x) => x.language));
for (const lang of languages) {
	const archives = tsvs.filter((x) =>
		noShitty(
			x.name,
		) && x.language === lang
	);
	for (const archive of archives) {
		await implCommandOutput.runCmds([
			`curl -sLk ${archive.url} | head -n 350000 >> data/${lang}.tsv`,
		]);
		console.log(`Completed ${archive.name} of ${lang}`);
	}
}
