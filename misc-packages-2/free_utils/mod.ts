import { Free, use } from "../deps.ts";

export const joinF = <F1>(f1: Free<F1, any>) => <F2>(f2: Free<F2, any>) =>
	use<F1 & F2>().map2((fxs) => Promise.all([f1.run(fxs), f2.run(fxs)]));
