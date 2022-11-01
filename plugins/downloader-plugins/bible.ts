import { runAugmenter } from "./augment.ts";
import { NetEffect, Ram, use } from "./deps.ts";

const getArchive = () =>
	use<NetEffect<Promise<Response>>>().map2((fx) =>
		fx.fetch(
			`https://archive.org/metadata/bible_alignments_v2`,
		)
	)
		.map((r) => r.json())
		.map((r) =>
			(r.files as { name: string; size: number }[]).map((x) => ({
				url: `https://archive.org/metadata/bible_alignments_v2/${x.name}`,
				size: x.size,
				language: x.name,
			}))
		);

const getTsv = (url: string) =>
	use<NetEffect<Promise<Response>>>().map2((fx) =>
		fx.fetch(
			url,
		)
	)
		.map((r) => r.text());

getTsv(`https://archive.org/download/bible_alignments_v2/wolof_senegal`)
	.map(
		runAugmenter(2)({
			columnDivider: "\t",
			postproc: (s) => s,
			settings: {
				recurse: 1,
			},
		}),
	)
	.map((xs) => Deno.writeTextFile("ckoshka-personal/data/wolof", xs.map(x => x.join("\t")).join("\n")))
	.run({ fetch });
