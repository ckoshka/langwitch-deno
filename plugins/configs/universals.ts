import { implParams } from "../deps.ts";

const now = () => new Date().getTime() / 1000 / 60 / 60;
export const implUniversals = {
	now: () => ({ hoursFromEpoch: now() }),
	...implParams(now()),
	readLogBase: () => 1.16,
};
