import { processOutboxBatch } from "./outbox.claimer";

let isRunning = false;
let timeoutId: Timer | null = null; // Keeps track of the scheduled timeout

export const startOutboxWorker = async () => {
  if (isRunning) return;
  isRunning = true;

  async function poll() {
    if (!isRunning) return;

    try {
      await processOutboxBatch();
    } catch (err) {
      console.error("Worker loop encountered an unexpected error:", err);
    } finally {
     
      if (isRunning) {
        timeoutId = setTimeout(poll, 2000);
      }
    }
  }

  poll();
};

export function stopOutboxWorker() {
  isRunning = false;
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
}
