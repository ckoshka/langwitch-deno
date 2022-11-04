import { Lens, Message, State, Stats } from "../../deps.ts";

export const stateLens = Lens.fromProp<Message<unknown, State>>()("state");
export const queueLens = Lens.fromProp<State>()("queue");
export const dbLens = Lens.fromProp<State>()("db");
export const learningLens = Lens.fromProp<State>()("learning");
export const knownLens = Lens.fromProp<State>()("known");
export const statsLens = Lens.fromProp<State>()("stats");
export const knownCountLens = Lens.fromProp<Stats>()("knownCount");
export const learnCountLens = Lens.fromProp<Stats>()("knownCount");
