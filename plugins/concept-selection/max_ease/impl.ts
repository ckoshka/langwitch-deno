export const maximiseEase = (learning: string[]) =>
	[...learning].map((c) => [c, c.length] as const)
		.sort((a, b) => a[1] - b[1]).map((a) => a[0]);
