import { processOutboxBatch } from "./outbox.claimer";
let isRunning=false
export const startOutboxWorker = async () => {
  async function poll() {
    if (!isRunning) return;
    try {
      await processOutboxBatch();
    } catch (err) {
      console.error("Worker loop encountered an unexpected error:", err);
    }
  }
  setTimeout(poll, 2000);
  isRunning = true
  poll()
}

export function stopOutboxWorker() {
  isRunning = false;
}
