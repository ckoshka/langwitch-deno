import { pack, toWords } from "../deps.ts";
import {
	alignerClient,
	preAlignmentFilter,
} from "../external-apis/clients/eflomal.ts";

const makeMin = (data: string) => {
	const chunks = data.split("|||");
	return chunks.slice(1).filter((s) => s.length > 0).map((seg) =>
		seg.split("\t") as [string, string]
	);
};

// needs to be reversed

const makePreproc = (sentences: [string, string][]) =>
	preAlignmentFilter({ sentences, direction: [1, 0], preprocess: true });

const align = (sentence: string): [number, number][] =>
	sentence.split(" ").map((s) =>
		s.split("-").map((c) => parseInt(c)).filter((c) => c > 0) as [
			number,
			number,
		]
	).filter((s) => s.length === 2);

const getAlignments = async (
	sentences: [string, string][],
) => {
	const text = makePreproc(sentences);
	const split = text.text.split("\n").map((x) =>
		x.split(" ||| ") as [string, string]
	);
	console.log("sending now");
	const maybe = await alignerClient.post(text);

	return maybe.map((m) =>
		m.split("\n").map((l, i) => [align(l), split[i]] as const)
	);
};

export const runMinimal = async (sentencesFile: string, outputFile: string) => {
	const res = Deno.readTextFileSync(
		sentencesFile,
	).split("\n").map(makeMin).flat();

	await getAlignments(res).then((m) =>
		m.map(pack).map((data) =>
			Deno.writeFile(
				outputFile,
				data,
			)
		).getOrElse(async () => console.log("failed"))
	);
};
