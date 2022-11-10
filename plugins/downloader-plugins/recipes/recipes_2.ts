import { hashObject, join, Ram} from "../deps.ts";

export type Recipe = {
	source: Partial<{
		url: string;
		filename: string;
		sh: string;
	}>;
	ratio: number;
};

export const makeRecipe = (recipes: Recipe[], total: number, cacheDir: string) => {
    const ratioTotal = recipes.map(r => r.ratio).reduce(Ram.add);
    const each = recipes.map(r => ({...r, count: Math.round((r.ratio / ratioTotal) * total), hash: hashObject(r.source)}));
    const locations = each.map(r => r.source.filename ? {...r, location: r.source.filename as string} : {...r, location: join(cacheDir, r.hash)});
    // expects them to already exist
    const cmds = locations.map(r => `cat ${r.location} | head -n ${r.count}`);
    const cmdsWithRedirect = cmds.map(cmd => `<(${cmd})` );
    return `paste -d '\\n' -z ${cmdsWithRedirect} | head -n ${total}`;
    // then save it, then hash that file, etc.
}