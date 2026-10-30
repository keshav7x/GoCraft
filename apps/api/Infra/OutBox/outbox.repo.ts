import { outboxEventsTable } from "../Database/schema";
import { randomUUID } from "node:crypto";
import type { OutboxEventType } from "./outbox.event";
type CreateOutboxEventInput = {
  type:OutboxEventType
  payload: Record<string, unknown>;
};

export class OutboxRepository {
  async create(input: CreateOutboxEventInput, tx?:any) {
     const payload = input.payload as Record<string, unknown>;
     const aggregateId =
       payload.id ??
       payload.userId ??
       payload.lessonId ??
       payload.moduleId ??
       randomUUID();

     const [event] = await tx
       .insert(outboxEventsTable)
       .values({
         aggregateType: input.type,
         aggregateId: String(aggregateId),
         payload: input.payload,
         status: "pending",
       })
       .returning();

     if (!event) {
       throw new Error("Failed to create outbox event");
     }

     return event;
   }

}
