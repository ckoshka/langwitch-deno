import { implParams } from "../deps.ts";

const now = () => new Date().getTime() / 1000 / 60 / 60;
export const implUniversals = () => ({
	now: () => ({ hoursFromEpoch: new Date().getTime() / 1000 / 60 / 60 }),
});
