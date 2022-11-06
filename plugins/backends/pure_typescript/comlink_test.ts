import * as Comlink from "https://esm.sh/comlink";
import { SomeWorker } from "./comlink_worker.ts";

async function init() {
    const worker = new Worker(new URL("./comlink_worker.ts", import.meta.url), {
        type: "module",
    });
    // WebWorkers use `postMessage` and therefore work with Comlink.
    const obj = Comlink.wrap<SomeWorker>(worker);
    alert(`Counter: ${await obj.counter}`);
    await obj.inc();
    alert(`Counter: ${await obj.counter}`);
  }
  init();