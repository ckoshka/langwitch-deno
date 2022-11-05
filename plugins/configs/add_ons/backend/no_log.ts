
export default {
	log: () => {},
	tap: (additionalMsg?: string) => <T>(data: T) => data
};
