import { Message, State, use } from "../../../deps.ts";
import Chime from "./Chime.js";
import { AudioEffect } from "./speak.ts";

export default <T>(
	msg: Message<T, State>,
) => use<AudioEffect>().map2((fx) => {
	fx.playAudio(Chime);
	return msg;
});

//TODO: make it read the Ding
