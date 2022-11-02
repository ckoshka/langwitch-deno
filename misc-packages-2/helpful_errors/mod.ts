// type
// what it's caused by
// steps to fix
// special symbol?

import { colors } from "./deps.ts";

export const LangwitchError = <Type extends string>(type: Type) => ({why, how, name}: {why: string, how: string[], name: string}) => <Data>(jsonData?: Data) => {
    return {
        [Symbol.for("Deno.customInspect")]() {
            let msg = name;
            const tab = ""
            msg += colors.magenta.bold(`\n\n(╥﹏╥) dang, we got a error!`);
            msg += colors.brightBlue.bold.underline(`\n\n${tab}type:`);
            msg += colors.brightBlue(` ${type}`);
            msg += colors.brightBlue.bold.underline(`\n\n${tab}it happened because:`);
            msg += colors.brightBlue(`\n${tab}${why}`);
            msg += colors.brightBlue.bold.underline(`\n\n${tab}here's how to fix it:`);
            msg += "\n" + how.map((f, i) => `${i}. ${f}`).join("\n");
            msg += colors.gray("\n----- details -----\n");
            msg += JSON.stringify(jsonData, null, 2);
            return msg;
        },
        type,
        name,
        data: jsonData
    } as LangwitchError<Type, Data>;
}

export type LangwitchError<Type extends string, Data> = {
    type: Type;
    name: string;
    data: Data;
}

throw LangwitchError("bingus")({why: "", how:[], name: "BingusError"})();