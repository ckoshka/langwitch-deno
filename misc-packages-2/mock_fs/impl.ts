const Dir = Symbol("dir");
type Dir = typeof Dir;
Deno.write;
export const MockFs = (): Pick<
	typeof Deno,
	"mkdir" | "writeFile" | "readFile"
> => {
	const fs: Record<string, Uint8Array | Dir> = {};
	// simpler hust to keep a list?
	// or a trie

	const stringify = (name: URL | string) =>
		name instanceof URL ? name.toString() : name;

	return {
		mkdir: async (
			dir,
			opts,
		) => {
			fs[stringify(dir)];
		},
		writeFile: async (path, data, opts) => {
			fs[stringify(path)] = data;
		},
		readFile: async (path, opts) => {
			const r = fs[stringify(path)];
			if (r === Dir) {
				throw Error("was a directory");
			}
			return r;
		},
	};
};

const fs = MockFs();
fs.mkdir("hello/goodbye/123");
fs.mkdir("hello/woodbye");
