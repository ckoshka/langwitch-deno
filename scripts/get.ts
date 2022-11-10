import { Command } from "https://deno.land/x/cliffy@v0.25.4/command/mod.ts";
import { getDatasets } from "../plugins/downloader-plugins/dataset.ts";

await new Command()
  .name("get")
  .version("0.1.0")
  .description("Helps you download language data")
  .option("-l, --lang <lang:string>", "the language you want", {
    required: true
  })
  .option("-d, --directory <directory:file>", "which directory to download things into", {
    default: "./data"
  })
  .option("-c, --concurrency <concurrency:number>", "how many sources to stream simultaneously", {
    default: 4
  })
  .option("-m, --mix <mix:boolean>", "whether to create a chunked mix of the data automatically", {
    default: true
  })
  .action(({lang, directory, concurrency, mix}) => {
    getDatasets
  })
  .parse(Deno.args);

  // steps:
  // - get a list of what's available - DONE
  // - confirm which directory (read from env variable, default is /data) - DONE
  // - confirm language, possibly search using that table thing
  // - parse the names and metadata into the type Dataset & DatasetMetadata (catch 3-part ones from early on)
  // - the tick-box thing with cliffy for selecting which ones to include or not include, display them prettily
  // - optional regex matcher thing
  // - download it, but with sensible concurrency (3?) to avoid hammering the poor internet archive and ppls wifi connections
  // - then create a mix using paste -d, show a nice progress bar
  // - then if the data is above 1 million, split it into 4 chunks (or however many cores are available)

  // - make it so that all of this can be prespecified either by the commandline or by a configuration file / recipe, or used programmatically