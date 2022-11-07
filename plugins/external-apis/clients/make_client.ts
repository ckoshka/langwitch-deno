import { Maybe, Rem } from "../tables/data/deps.ts";
import { baseUrl } from "./consts.ts";

export type ClientConfig<BeforePost, AfterResponse, PostType = BeforePost> = {
	route: `/${string}/`;
	before?: (data: BeforePost) => PostType;
	after: (data: BeforePost, resp: Response) => Promise<AfterResponse>;
};

type Depromisify<T> = T extends Promise<infer K> ? K : never;

export const Client = <BeforePost, AfterResponse, PostType = BeforePost>(
	cfg: ClientConfig<BeforePost, AfterResponse, PostType>,
) => {
	return {
		post: (data: BeforePost) =>
			Rem.pipe(
				data,
				cfg.before ??
					((t: unknown) => t) as NonNullable<typeof cfg.before>,
				(body) =>
					fetch(baseUrl + cfg.route, {
						method: "POST",
						body: JSON.stringify(body),
						headers: {
							"Content-Type": "application/json",
						},
					}),
				(resp) => resp.then((r) => cfg.after(data, r)).then(d => Maybe.some(d)).catch(() => Maybe.none()) as Promise<Maybe<AfterResponse>>,
			),
	};
};
