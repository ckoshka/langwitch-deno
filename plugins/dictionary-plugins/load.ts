import { colors, Rem, unpack, SyncGen } from "../deps.ts";

export type DictionaryEntry = ([[number, number][], [string, string]]);
// assumes col 0
const filterByWord = (word: string) => SyncGen.filter((d: DictionaryEntry) => d[1] && d[1][0].includes(word));

const highlight = (word: string) => (entry: DictionaryEntry) => {
    try {
        const w1 = entry[1][0].split(" ");
        const w2 = entry[1][1].split(" ");
        const idx1 = w1.findIndex(w => w === word);
        // might be -1
        //console.log(entry[0]);
        const idx2 = entry[0].filter(([pos1, _]) => pos1 === idx1)[0][1];
        w1[idx1] = colors.bold(w1[idx1]);
        w2[idx2] = colors.bold(w2[idx2]);
        return [w1.join(" "), w2.join(" ")];
    } catch {
        return [];
    }
}

const data = await Deno.readFile(Deno.args[0])
    .then(unpack);

for(;;) {
    const wd = prompt("what word do you want to look up?")?.replace("\n", "") || "";
    Rem.pipe(
        data,
        filterByWord(wd),
        SyncGen.map(highlight(wd)),
        SyncGen.filter((l: string[]) => l.length === 2),
        SyncGen.take(100),
        SyncGen.map(pair => {
            console.log(colors.brightMagenta(pair[0]));
            console.log(colors.brightBlue(pair[1]));
            console.log(colors.gray("---------"))
        }),
        SyncGen.consume
    );
}