import { use } from "../../deps.ts";

export const useNothing = <T>(a0: () => T) => use<Record<never, never>>().map(a0);