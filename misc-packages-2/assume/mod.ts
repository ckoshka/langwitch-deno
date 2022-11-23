// check quickly if something is on the path?
// no, use a binaries folder
// darwin
// linux
// win32
import {tgz, unZipFromFile, Os} from "./deps.ts";

export type ReleaseURLData = {
	owner: string;
	repoName: string;
	versionName: string;
	platform: "darwin" | "linux" | "win32";
};
export const makeReleaseUrl = (d: ReleaseURLData) =>
	`https://github.com/${d.owner}/${d.repoName}/releases/download/${d.versionName}/${d.repoName}_${d.versionName}_${
		d.platform === "darwin"
			? "x86_64-apple-darwin.zip"
			: d.platform === "linux"
			? "x86_64-unknown-linux-musl.tar.gz"
			: "x86_64-pc-windows-gnu.zip"
	}`;

export const fetchBinary = async (d: ReleaseURLData) => {
	const url = makeReleaseUrl(d);
    const repoName = d.repoName.replace(".rs", "");
    const outName = repoName + d.platform === "linux" ? `.tar.gz` : ".zip";
    const finalName = repoName + d.platform === "win32" ? ".exe" : "";
    await fetch(url).then(r => r.arrayBuffer()).then(a => new Uint8Array(a)).then(a => Deno.writeFile(outName, a));
    return d.platform === "linux" ? (await tgz.uncompress(outName, finalName), finalName) : await unZipFromFile(outName);
};

// it would be a lot clearer and require fewer file-system gimmicks to just do this part in nix and assume it to be part of the environment instead of explicitly passing in the values at runtime
// but it might make sense to quickly perform checks on each of them
// https://github.com/ckoshka/langwitch_encode/releases/download/v0.1/langwitch_encode_v0.1_x86_64-apple-darwin.zip
/*
console.log(makeReleaseUrl({
    owner: "ckoshka",
    repoName: "langwitch_encode",
    versionName: "v0.1",
    platform: "darwin"
}))
*/
// on windows, becomes .exe, otherwise plain
// 1. detect file-type
// 2. gunzip foo.tar.gz; tar -xf foo.tar
// else 1. unzip foo.zip
// then move into the binaries folder

// oh wait, git was just for installing stuff. you don't even need it, just deno
// but then there's the issue of mpv (does it ship as a single binary?).
// dotted cmdln flags?
