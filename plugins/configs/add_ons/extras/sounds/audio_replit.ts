export const implAudioReplit = {
	playAudio: async (audio: Uint8Array) => {
        const temp = await Deno.makeTempFile();
        await Deno.writeFile(temp, audio);
		const proc = Deno.run({
			cmd: ["bash", "-c", `echo '{
                "Paused": false,
                "Name": "${temp}",
                "Type": "mp3",
                "Volume": 1,
                "DoesLoop": false,
                "Args": {
                  "Path": "${temp}"
                }
              }' > /tmp/audio`],
			stdin: "piped",
			stdout: "null",
			stderr: "null",
		});
		await proc.stdin.write(audio);
		proc.stdin.close();
		await proc.status();
		proc.close();

    await Deno.remove(temp);
	},
};