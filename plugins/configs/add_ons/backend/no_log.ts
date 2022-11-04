import { LangwitchEffect } from "../../language2.ts";

export default <Pick<LangwitchEffect, "log" | "tap">> {
	log: () => {},
	tap: (_) => (m) => m,
};
