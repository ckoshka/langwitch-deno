import { Ram, SyncGen } from "../deps.ts";

type Head = string;
type Tail = string;

type English = string;
type Other = string;
type Fragment = [English, Other];

type PreprocSettings = {
	columnDivider: string;
	postproc: (s: string) => string;
	settings: Settings;
};
type Settings = {
	recurse: number;
	// how many times to feed the results of join back into map to get increasingly lengthy fragments
};

export const runAugmenter = (numWordsToJoin: number) => {
	const head = (f: Fragment): Head =>
		f.map((s) => s.split(" ").slice(0, numWordsToJoin).join(" ").trim())
			.join("|");
	const tail = (f: Fragment): Tail =>
		f.map((s) => s.split(" ").slice(-numWordsToJoin).join(" ").trim()).join(
			"|",
		);

	const map =
		<T extends string>(key: (s: Fragment) => T) =>
		(sx: Generator<Fragment>): Map<string, Fragment[]> =>
			Ram.pipe(
				//SyncGen.tap(console.log),
				SyncGen.fold<Map<string, Fragment[]>, Fragment>(
					new Map(),
					(prev, curr) =>
						[0, 1].every((i) =>
								curr[i].split(" ").length > numWordsToJoin
							)
							? prev.get(key(curr)) === undefined
								? prev.set(key(curr), [curr])
								: prev.set(
									key(curr),
									prev.get(key(curr))!.concat([curr]),
								)
							: prev,
				),
			)(sx);

	const join =
		(tailMap: Map<Tail, Fragment[]>) =>
		(headMap: Map<Head, Fragment[]>): Generator<Fragment> =>
			Ram.pipe(
				() => tailMap.keys(),
				SyncGen.map((k) => (headMap.get(k) ? k : null)),
				SyncGen.filter((k): k is Head => k !== null),
				SyncGen.map((k) =>
					tailMap
						.get(k as string)!
						.map((tailfrag) =>
							headMap
								.get(k as string)!
								.filter(
									(headfrag) =>
										headfrag.join("|") !=
											tailfrag.join("|"),
								)
								.map(
									(headfrag) =>
										[0, 1].map(
											(i) =>
												tailfrag[i].split(" ").slice(
													0,
													-numWordsToJoin,
												).join(
													" ",
												).trim() + " " +
												headfrag[i].trim(),
										) as Fragment,
								)
						)
						.flat()
				),
				SyncGen.flatten,
				SyncGen.filter((l) =>
					!l[0].includes("james") && !l[0].includes("bartholomew")
				),
				SyncGen.take(500000),
			)();

	const run = ({ recurse }: Settings) => (sx: Fragment[]): Fragment[] =>
		recurse === 0 ? sx : Ram.pipe(
			map(head),
			join(map(tail)(SyncGen.fromIter(sx))), // at this point we could split them into batches
			// then invoke join and run on each of them, leaving deduplication to the parent process
			// or use msgpack serialisation to temporarily offload data
			// in that case, the chunking needs to be lazy
			// if we recurse, it's unlikely that we would need the original part.
			(newsxs) =>
				run({ recurse: recurse - 1 })(sx.concat(Array.from(newsxs))),
		)(SyncGen.fromIter(sx));

	const main = (cfg: PreprocSettings) =>
		Ram.pipe(
			Ram.split("\n"),
			SyncGen.fromIter,
			SyncGen.filter((line: string) => line.includes(cfg.columnDivider)),
			SyncGen.map((line) => cfg.postproc(line)),
			SyncGen.map((line) =>
				line.split(cfg.columnDivider).map((s) => s.trim()) as Fragment
			),
			SyncGen.filter((frag: Fragment) => frag.length === 2),
			SyncGen.toArray,
			run(cfg.settings),
			SyncGen.toArray<Fragment>,
		);

	return main;
};
