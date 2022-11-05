import { use } from "../../../../deps.ts";

export type AudioFromYoutubeEffect = {
	playYoutubeAudio: (url: string) => Deno.Process;
};

export const implYoutubeAudio = {
	playYoutubeAudio: (url: string) =>
		Deno.run({
			cmd: [`mpv`, `--loop`, `--no-video`, `--volume=65`, url],
			stdin: "piped",
			stdout: "null",
			stderr: "null",
		}),
};

export type PlaylistState = {
	proc: Deno.Process;
	is: "playing" | "paused";
} | {
	proc: null;
	is: "unstarted";
};

export const Playlist = use<AudioFromYoutubeEffect>()
	.map2((fx) => (url: string) => {
		let state: PlaylistState = {
			proc: null,
			is: "unstarted",
		};
		//const toggle = () => state.proc?.stdin?.write(new TextEncoder().encode(" "));
		return {
			play: async () => {
				switch (state.is) {
					case "playing":
						return;
					case "unstarted": {
						state = {
							proc: fx.playYoutubeAudio(url),
							is: "playing",
						};
						return;
					}
				}
			},
			stop: async () => {
				switch (state.is) {
					case "playing": {
						state.proc.kill("SIGTERM");
						state = {
							proc: null,
							is: "unstarted",
						};
						return;
					}
					case "unstarted":
						return;
					case "paused":
						return;
				}
			},
		};
	});

/*
Playlist.map(async fn => {
    const player = fn(`https://www.youtube.com/watch?v=t4u_PLGdRqE`);

    //await new Promise(resolve => setTimeout(resolve, 9000));
    for(;;) {
        await player.play();
        await new Promise(resolve => setTimeout(resolve, 5000));
        await player.stop();
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}).run({
    ...implYoutubeAudio
})
*/
// write a space to pause it?

//`https://www.youtube.com/watch?v=t4u_PLGdRqE`
