// you could avoid returning the env via env = Deno.readTextFile() by having a general type then each action causes it to be narrowed down?


class Narrow<T extends Record<string, string>> {
    constructor(public item: Record<string, string>) {

    }

    hasProp <S extends string>(prop: S): this is Narrow<T & Record<S, string>> {
        return true;
    }
} 

const isTrue = (bool: boolean): bool is true => {
    if (!bool) {
        throw new Error();
    }
    return true as const;
}

const n = new Narrow({});
isTrue(n.hasProp("hi"))

const x = n;