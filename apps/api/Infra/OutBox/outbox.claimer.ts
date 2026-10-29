import { db } from "../Database";
import { outboxEventsTable } from "../Database/schema";
import { and, inArray, lte, sql,eq } from "drizzle-orm";
import { sendEmail } from "../../Services/sendEmail";

const BATCH_SIZE = 10;
const MAX_RETRIES = 5;

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
      await db.
        update(outboxEventsTable).
        set({ status: "pending" }).where(eq(outboxEventsTable.id,record.id))
      const { email, otp } = record.payload as { email: string, otp: number }
      await sendEmail({
        email,otp
      })
      await db.update(outboxEventsTable).set({
        status: "processed"
      }).where(eq(outboxEventsTable.id,record.id))
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
        console.error(` Critical: Outbox event ${record.aggregateId} exceeded max retries.`);
      }
    }
  }
  
  
}
