import * as Comlink from "https://esm.sh/comlink";

const obj = {
    counter: 0,
    inc() {
      this.counter++;
    },
  };

export type SomeWorker = typeof obj;
Comlink.expose(obj);