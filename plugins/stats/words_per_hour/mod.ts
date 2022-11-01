type WordsPerHour = number;
type LearnCount = number;
type Hours = number;

const average = (takeLast: number) => (arr: WordsPerHour[]) =>
	arr.slice(-takeLast).reduce((a, b) => a + b, 0) / arr.length;
const wordsPerHour = (count: LearnCount) => (elapsed: Hours) => count / elapsed;

export type WordsPerHourArgs = {
	takeLast?: number;
	init?: WordsPerHour[];
	defaultValue?: WordsPerHour;
	startDate: Hours;
};

export const WordsPerHourCalculator = (c_: WordsPerHourArgs) => {
	const c: Required<WordsPerHourArgs> = {
		takeLast: 20,
		init: [],
		defaultValue: 0,
		...c_,
	};
	const init = Array.from({ length: c.takeLast - c.init.length }).map(() =>
		c.defaultValue
	).concat(c.init);

	const self = {
		push: ({ count, hoursNow }: { count: number; hoursNow: Hours }) => {
			const wph = wordsPerHour(count)(hoursNow - c.startDate);
			init.push(wph);
			return self;
		},
		avg: () => average(c.takeLast)(init),
	};

	return self;
};

/*const calc = WordsPerHourCalculator({
	takeLast: 20,
	init: [],
	defaultValue: 0,
	startDate: 0,
});

console.log(calc.push({count: 23, hoursNow: 0.5}).avg());
*/
