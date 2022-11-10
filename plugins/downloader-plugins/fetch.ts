import { downloadLanguage } from "./archive_org.ts";
import { implCommandOutput } from "../io_effects/mod.ts";

downloadLanguage(Deno.args[0])
    .run({
        catBinaryPath: "cat",
        curlBinaryPath: "curl",
        fetch,
        ...implCommandOutput,
        homeFolder: Deno.args[1],
    })