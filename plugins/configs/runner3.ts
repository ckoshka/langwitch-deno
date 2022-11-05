import { Exit, Known, Remove, Save, Stats } from "./add_ons/extras/mod.ts";
import {
	createL0Config,
	createL2Config,
	initialiseLangwitch,
	L1Config,
	LangwitchMachine,
} from "./language3.ts";

(async () => {
	const L0 = await createL0Config({
		conceptsFile: `langwitch-home/concepts/venetian.json`,
		sentencesFile: `langwitch-home/data/venetian`,
		binariesFolder:
			`/Users/ckoshka/programming/rust-experiments/everything/target/release`,
	});

	const L1 = L1Config.modify((cfg) => {
		cfg.params.maxLearnable = 3;
	});

	const L2Original = await createL2Config(L1.get());

	const L2 = L2Original.modify((cfg) => {
		cfg.renderHint = (s) =>
			(m) => {
				return L2Original.get().renderHint(s)(m).replaceAll("•", "-");
			};
	});

	const L3 = LangwitchMachine.appendF("quiz", Exit("!x"))
		.appendF("quiz", Known("!k"))
		.append("quiz", Remove!("r"))
		.appendF("process", Save)
		.appendF("process", Stats())
		.get();

	await initialiseLangwitch(L3).run({
		...L0.get(),
		...L1.get(),
		...L2.get(),
	});
})();
