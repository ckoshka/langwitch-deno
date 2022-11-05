import { use,Message,State } from "../../../deps.ts";
import { LangwitchMessage, ToMark } from "../../../state-transformers/mod.ts";

export type CommandInterpreter = {
    hasCommand: (msg: Message<ToMark, State>) => boolean;
    do: (msg: Message<ToMark, State>) => LangwitchMessage | Promise<LangwitchMessage>;
}

export type InterpretCommandsEffect = {
    getCommandInterpreters: CommandInterpreter[];
}

export default 
	use<InterpretCommandsEffect>().map2(fx => async (
		m: Message<ToMark, State>,
	) => {
		for (const cmd of fx.getCommandInterpreters) {
            if (cmd.hasCommand(m)) return cmd.do(m);
        }
        return m;
	});

// or, even easier: accept a stack of interpreters.
// some of these require effects, so Interpret.map(i => ??)
// so i think we need the machine to be handed out kinda
// nontraditional method would work?
// higher-level: get commands