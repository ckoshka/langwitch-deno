
export type Message<T, S> = {
	data: T;
	state: S;
	next: string;
};