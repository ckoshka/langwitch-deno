
export type Path<T> = [
	(m: unknown) => m is T,
	(data: T) => unknown,
];


export const isLike = <T extends Zod.ZodObject<Zod.ZodRawShape>>(validatorObj: T) => {
	return (obj: unknown): obj is Zod.infer<T> =>
		validatorObj.safeParse(obj).success === true;
};


export const matchWith = (
	paths: Path<any>[] = [],
) => {
	return <T>(msg: T) => {
        for (const path of paths) {
            if (path[0](msg)) {
                return path[1](msg);
            }
        }
        return msg;
    }
}