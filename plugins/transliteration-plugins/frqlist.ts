import { getStdin, toWords } from "../deps.ts";
import { transliterateLimax } from "./limax.ts";


export const allWords = async (sentences: AsyncIterableIterator<string>) => {
    const words = new Set<string>();
    let total = 0;
    for await (const s of sentences) {
        toWords(s).forEach(w => {
            const lower = w.toLowerCase();
            if (!words.has(lower)) words.add(lower); 
        });
        total += 1;
        total % 500 === 0 ? console.log(total) : {};
    }
    return words;
}

const stdin = async function*() {
    for(let i = 0; i < 1000; i++) {
        try {
            yield await getStdin();
        } catch {
            break;
        }
    }
};
