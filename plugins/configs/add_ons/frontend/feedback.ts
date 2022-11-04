import {
	Br,
	Cls,
	Input,
	Line,
	Message,
	Rem,
	State,
	use,
	UserInputEffect,
} from "../../../deps.ts";
import { PrinterEffect } from "../../../state-transformers/helpers/effects/print.ts";
import { ToProcess } from "../../../state-transformers/mod.ts";
import { isLanguageMetadata } from "../../shared/mod.ts";
import fx from "./io.ts";

export default use<
	& PrinterEffect
	& UserInputEffect<Promise<string>>
>()
	.map2((fx) => async (m: Message<ToProcess, State>) => {
		const metadata = m.state.queue[0].metadata;
		if (isLanguageMetadata(metadata)) {
			Rem.pipe(
				[
					Cls,
					Br,
					["primary", "(❀ˆᴗˆ) my translation is:"],
					["secondary underlined", metadata.front],
					["secondary underlined", metadata.back],
					Br,
					...m.data.results.map((
						[concept, score],
					) => [
						"tertiary",
						`${concept} ➤ ${Math.round(score * 100)}`,
					] as Line),
					Br,
				],
				fx.print,
			);
			await Input.prompt("press enter to continue");
		}
		return m;
	});
