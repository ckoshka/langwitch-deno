import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";
import { Ram } from "../deps.ts";

const getEls = async (url: string) => {
	const $ = await fetch(url)
		.then((r) => r.text())
		.then(cheerio.load);

	return $("li > div.play").toArray().map((e) => e.attribs).map((e) => ({
		word: e.title.replace("Listen ", "").replace(" pronunciation", ""),
		url: atob(e.onclick.split(`false,'`)[1].split("','")[0]),
	})).filter((e) => e.url.length > 0).map((e) => ({
		...e,
		url: "https://audio12.forvo.com/audios/mp3/" + e.url,
	}));
};

const getUrls = (languageCode: string) =>
	(range: number) =>
		Ram.range(1, range + 1).map((i) =>
			`https://forvo.com/languages-pronunciations/${languageCode}/page-${i}/`
		);

const scrape = (languageCode: string) =>
	(range: number) =>
		Promise.all(getUrls(languageCode)(range).map(getEls))
			.then(Ram.flatten)
			.then(async (_axs) => {
				try {
					await Deno.mkdir(`audio_data/${languageCode}`);
				} catch {
					//
				}
				const axs = _axs.slice();
				const worker = async () => {
					for (;;) {
						const a = axs.pop();
						if (a === undefined) {
							break;
						}
						await fetch(a.url).then((r) => r.arrayBuffer()).then((
							r,
						) => new Uint8Array(r))
							.then((r) =>
								Deno.writeFile(
									`audio_data/${languageCode}/${a.word}.mp3`,
									r,
								)
							)
							.then(() => console.log(`Wrote ${a.word}`));
					}
				};
				await Promise.all(Ram.range(0, 30).map(worker));
			});

scrape("cv")(60).then(() => Deno.exit())
// approx 90 per page