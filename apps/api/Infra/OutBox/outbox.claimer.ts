import { db } from "../Database";
import { outboxEventsTable } from "../Database/schema";
import { and, inArray, lte, eq } from "drizzle-orm";
import { sendVerificationEmail } from "../../Services/sendEmail";

const BATCH_SIZE = 10;
const MAX_RETRIES = 5;

type VerifyEmailPayload = {
  email?: string;
  token?: string;
  expiresAt?: string;
};

const dispatchEvent = async (aggregateType: string, payload: unknown): Promise<void> => {
  switch (aggregateType) {
    case "VERIFY_EMAIL": {
      const { email, token, expiresAt } = (payload ?? {}) as VerifyEmailPayload;
      if (!email || !token) {
        throw new Error("VERIFY_EMAIL payload is missing email or token");
      }
      await sendVerificationEmail({ email, token, expiresAt });
      return;
    }
    default:
      // No consumer for this event type yet — acknowledge it so it does not block the queue.
      return;
  }
};

export const processOutboxBatch = async () => {
  const records = await db.transaction(async (tx) => {
    return await tx.
      select().
      from(outboxEventsTable).
      where(
        and(
          inArray(outboxEventsTable.status, ["pending", "failed"]),
          lte(outboxEventsTable.nextAllowedAttemptAt, new Date())
        )
    ).
    orderBy(outboxEventsTable.createdAt).
    limit(BATCH_SIZE).
    for("update", { skipLocked: true })
  })
  if (!records || records.length == 0) return

  for (const record of records) {
    try {
      await dispatchEvent(record.aggregateType, record.payload);
      await db.update(outboxEventsTable).set({
        status: "processed",
        processedAt: new Date()
      }).where(eq(outboxEventsTable.id, record.id))
    } catch (err: any) {
      const nextRetryCount = record.retryCount + 1
      const isDeadLetter = nextRetryCount >= MAX_RETRIES
      const backoffSeconds = Math.pow(2, nextRetryCount) * 15;
      const nextAttempt = new Date(Date.now() + backoffSeconds * 1000);

      await db.update(outboxEventsTable).set(({
        status: isDeadLetter ? "failed" : "pending",
        retryCount: nextRetryCount,
        errorReason: err?.message || "Unknown API error",
        nextAllowedAttemptAt:nextAttempt
      })).where(eq(outboxEventsTable.id, record.id))

      if (isDeadLetter) {
        console.error(` Critical: Outbox event ${record.id} (${record.aggregateType}) exceeded max retries.`);
      }
    }
  }


}
