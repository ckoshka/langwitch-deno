// greet user
// give overview of garden health
// give overview of language proficiency
// say what goal, choose a target

import { Cls, colors, Component, Concept, LoggerEffect, use } from "./deps.ts";
import { FamiliarData, familiars } from "./familiar.ts";

// show streak
export type DomainStats = {
	name: string;
	learned: number;
	needsReview: number;
	sessions: SessionStats[];
};

export type SessionStats = {
	learned: number;
	reviewed: number;
};

export type Session = SessionStats & {
	reactionTimes: number[];
	start: Date;
	end: Date;
	finalState: Concept[];
};

export type BootData = {
	domains: DomainStats[];
	familiar: FamiliarData;
	name: string;
	streak: number;
};

const show = (data: BootData) =>
	use<LoggerEffect>().map2((f) => {
		const log = (text: string) =>
			f.log(
				`%c ${data.familiar.symbol} ${data.familiar.name} %c ${text}`,
				`background-color: ${data.familiar.color}`,
				`color: green`,
			);

		log(`Welcome back, ${colors.bold(data.name)}!`);
		log(`Here's a summary of your garden:\n`);
		log(`⛅ You are on a ${colors.bold(data.streak.toString())} day streak`);
		data.domains.forEach((d) => {
			const avg = d.sessions.map((s) => s.learned).reduce((a, b) =>
				a + b, 0.0) /
				d.sessions.length;
			log(`🌲 For ${colors.bold(d.name)}, ${
				colors.bold(d.learned.toString())
			} are planted, ${
				colors.bold(d.needsReview.toString())
			} need watering`);
			// Nan
			log(`🌱 On average, you learn ${colors.bold(avg.toString())} a day`);
			// record of 100 whatever a day
			log(`📆 At this rate, you would know ${
				colors.bold("3000")
			} words by ${
				colors.bold(
					new Date(Date.now() + ((3000 - d.learned) / avg) * 86400000)
						.toLocaleDateString(),
				)
			}`);
		});
	});
// autolearn mode
for (const familiar of familiars) {
	show({
		familiar,
		name: "Catherine",
		streak: 5,
		domains: [{
			learned: 53,
			name: "Spanish",
			needsReview: 12,
			sessions: [{ learned: 25, reviewed: 10 }, {
				learned: 20,
				reviewed: 0,
			}],
		}],
	})
		.run({
			log: console.log,
		});
}
//TODO: Add kaomoji
