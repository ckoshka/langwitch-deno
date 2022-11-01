import { LoggerEffect, TimeEffect, use } from "../../deps.ts";

export type TimerFormatString = `${string}<time>${string}`;

export const implTimer = use<LoggerEffect & TimeEffect<number>>()
	.extendF((f) => {
		return {
			measure:
				(formatString: TimerFormatString) =>
				async <T>(fn: () => T | Promise<T>) => {
					const then = f.now();
					const result = await fn();
					const after = f.now();
					f.log(
						formatString.replace(
							"<time>",
							(after - then).toPrecision(6),
						),
					);
					return result;
				},
		};
	});

export const implTime = {
	now: () => new Date().getTime(),
};
