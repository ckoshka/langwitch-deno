export type CreateGoalConfig = {
	first: number; // e.g 4
	next: number; // if you're at 10 words, it'll set 15, etc.
};

// fibbonaci sequence?

export const createGoal = (
	{ first, next }: CreateGoalConfig = { first: 4, next: 3 },
) => {
	const generator = function* () {
		let start = first;
		for (;;) {
			yield start;
			start += Math.floor(start / next);
		}
	};
	return (current: number) => {
		for (const n of generator()) {
			if (n > current) {
				return n;
			}
		}
		return 0;
	};
};
