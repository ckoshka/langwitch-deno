import {
	AsyncGen,
	iterateReader,
	Maybe,
	Ram,
	readerFromStreamReader,
	readLines,
	Rem,
} from "../deps.ts";

const captureSentence = (line: string) => {
	const match = line.match(
		/<tuv xml:lang="([^"]+)"><seg>([^<]+)<\/seg><\/tuv>/,
	);
	return match
		? Maybe.some({
			lang: match[1],
			sentence: match[2],
		})
		: Maybe.none();
};

const decomp = (url: string) =>
	fetch(url).then((r) =>
		r.body!.pipeThrough(new DecompressionStream("gzip")).getReader()
	).then(readerFromStreamReader)
		.then(readLines);

const translations = async function* (
	lines: AsyncIterableIterator<string>,
) {
	const getNext = () =>
		lines.next().then((l) =>
			l.value ? captureSentence(l.value) : Maybe.none()
		);

	for (;;) {
		const [l1, l2] = [await getNext(), await getNext()];
		if (l1.isNone() || l2.isNone()) {
			continue;
		}
		yield [l1.get(), l2.get()];
	}
};

(async () => {
	const iter = await decomp(
		`https://object.pouta.csc.fi/OPUS-bible-uedin/v1/tmx/en-wo.tmx.gz`,
	);
	await Rem.pipe(
		iter,
		translations,
		AsyncGen.map((t) => console.log(t)),
		AsyncGen.take(100),
		AsyncGen.toArray,
	);
	//console.log("Done");
})();
