export default {
	now: () => ({ hoursFromEpoch: new Date().getTime() / 1000 / 60 / 60 }),
};
