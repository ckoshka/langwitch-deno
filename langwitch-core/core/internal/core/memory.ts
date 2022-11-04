import {
	Memory,
	MemoryConstantsReader,
	ParamsReader,
	TimeEffect,
	use,
} from "../../deps.ts";
import {
	FitMemoryArgs,
	HalfLifeArgs,
	PredictArgs,
	RemodelArgs,
} from "./memory_arg_types.ts";

export const calcLog = (base: number) => (x: number) =>
	Math.log(x) / Math.log(base);

export const Mem = ({ logBase } = { logBase: 1.168 }) => {
	const fit = ({ memory, recordedAt, accuracy }: FitMemoryArgs) =>
		calcLog(logBase)(accuracy) / (recordedAt - memory.lastSeen);

	const remodel = ({ flexibility, estimatedCurve, oldDecay }: RemodelArgs) =>
		(estimatedCurve * flexibility) + oldDecay * (1 - flexibility);

	const predict = ({ when, memory }: PredictArgs) =>
		Math.pow(logBase, memory.decayCurve * (when - memory.lastSeen));

	const halfLife = ({ halfLifeDefinition, memory }: HalfLifeArgs) =>
		(-1 * (1 / memory.decayCurve)) *
		calcLog(logBase)(1 / halfLifeDefinition);

	return { fit, remodel, predict, halfLife };
};

export const adjust = (c: Memory) => (accuracy: number) =>
	use<
		& TimeEffect<{ hoursFromEpoch: number }>
		& ParamsReader
		& MemoryConstantsReader
	>().map2(
		(f) => {
			const { fit, remodel } = Mem({ logBase: f.readLogBase });
			const estimate = fit({
				memory: c,
				recordedAt: f.now().hoursFromEpoch,
				accuracy: accuracy,
			});
			const normalisedEstimate = estimate > -0.0001
				? -0.000001
				: estimate < f.params.initialDecay
				? f.params.initialDecay
				: estimate;
			return {
				decayCurve: remodel(
					{
						flexibility: f.params.flexibility,
						estimatedCurve: normalisedEstimate,
						oldDecay: c.decayCurve,
					},
				),
				lastSeen: f.now().hoursFromEpoch,
			};
		},
	);
//_test()
// y = e^{-0.3x} - (hoursSinceLastSeen)
