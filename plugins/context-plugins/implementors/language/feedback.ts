import { LanguageMetadata } from "../../context-types/mod.ts";
import { Message, Phase, State, use, UserInputEffect } from "../../deps.ts";
import { GetMetadataEffect } from "../../helpers/effects/metadata.ts";
import { PrinterEffect } from "../../helpers/effects/print.ts";
import { ToProcess } from "../message_types.ts";
import { ShowResults } from "./showable.ts";

export default (m: Message<ToProcess, State>) =>
use<
	& PrinterEffect
	& GetMetadataEffect<LanguageMetadata>
	& UserInputEffect<Promise<string>>
>().map2(async (fx) => {
	const meta = fx.getMetadata(m.state.queue[0].id);
	await fx.print(ShowResults({
		referenceAnswer: meta.back,
		conceptScores: m.data.results,
		referenceQuestion: meta.front
	}));
	await fx.ask("press enter to continue");
	return m;
})
