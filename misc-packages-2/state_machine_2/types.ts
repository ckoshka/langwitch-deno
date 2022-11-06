import { ImmutableMap } from "./deps.ts";

export type Message<T, S> = {
	data: T;
	state: S;
	next: string;
	map: ImmutableMap<string, unknown>;
};

// could we make modifications and accessors more declarative? maybe via a revisable??????
// could a revisable have short-circuiting option<T>? lens-based access?
// asserting things about a specific property? sort of granularly refining a type narrowing?
// i.e "do this, but only if this property is in this shape"
// that would mean we wouldn't even need an if-branch for some of the extensions because the change simply wouldn't take place without the desired property (side effects?)
// ok, but what about serialising and retrieving complex data-structures in the map? discourage this?
// imagine this:
