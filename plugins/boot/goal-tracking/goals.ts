// pattern: hydrate with data, turn into behavioural functionality with clear semantics
// intensity, duration, frequency
// minutes to review 10 words
// minutes to learn 10 words

type Days = number & { ____days: never };
export type StreakStats = {
	longestStreak: Days;
	currentStreak: Days;
};

export const Stats = {
	currentStreak: (dates: Date[]) => {
		let streak = 0;
		const sxs = dates.slice();
		//sxs.sort((a, b) => b.getTime() - a.getTime());
		let currSession = sxs.pop();
		for (;;) {
			streak += 1;
			if (currSession === undefined) {
				break;
			}
			const prevSession = sxs.pop();
			if (prevSession === undefined) {
				break;
			}
			const dur = currSession.getTime() - prevSession.getTime();
			if (dur > 106400000) {
				break;
			}
			currSession = prevSession;
		}
		return streak as Days;
	},
	longestStreak: (dates: Date[]) => {
		let streak = 0;
		let longest = 0;
		const sxs = dates.slice();
		let currSession = sxs.pop();
		for (;;) {
			streak += 1;
			if (streak > longest) {
				longest = streak;
			}
			if (currSession === undefined) {
				break;
			}
			const prevSession = sxs.pop();
			if (prevSession === undefined) {
				break;
			}
			const dur = currSession.getTime() - prevSession.getTime();
			if (dur > 106400000) {
				streak = 0;
			}

			currSession = prevSession;
		}
		return longest as Days;
	},
};

//const clone = (date: Date) => unpack(pack(date));

/*
(() => {
    const dates: Date[] = [];
    const date = new Date();
    for(let i =0; i < 15; i++) {
        dates.push(clone(date));
        date.setUTCHours(date.getUTCHours() - 2)
        date.setDate(date.getDate() + 1);
    }
    date.setDate(date.getDate() + 2)
    dates.push(date);
    console.log(Stats.longestStreak(dates));
})()
*/
