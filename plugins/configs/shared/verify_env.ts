export const fromEnv = (variableName: string, orElse?: string) => {
	const result = Deno.env.get(variableName);
	if (result === undefined && orElse === undefined) {
		throw `You need to ensure this environmental variable is set: "${variableName}"`;
	}
	return result || orElse as string;
};

export const importDefault = <T>(path: string) =>
	import(path).then((m) => m.default) as Promise<T>;
