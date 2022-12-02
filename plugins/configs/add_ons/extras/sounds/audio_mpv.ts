export const implAudio = ({ mpvPath }: { mpvPath: string }) => ({
	playAudio: async (audio: Uint8Array) => {
		const proc = Deno.run({
			cmd: [mpvPath, `--volume=75`, `-`],
			stdin: "piped",
			stdout: "null",
			stderr: "null",
		});
		await proc.stdin.write(audio);
		proc.stdin.close();
		await proc.status();
		proc.close();
	},
});