import { spawn, type ModuleThread } from "threads";

import { type Worker } from "./Worker";
import WorkerInline from "./Worker?worker&inline";

let worker: Promise<ModuleThread<Worker>>;

export async function getWorker(): typeof worker {
  if (worker == null) {
    worker = spawn<Worker>(new WorkerInline());
  }
  return await worker;
}
