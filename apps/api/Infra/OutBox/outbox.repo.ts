import { outboxEventsTable } from "../Database/schema";
import { outboxStatusEnum } from "../Database/enum";
import type { OutboxEventType } from "./outbox.event";
type CreateOutboxEventInput = {
  type:OutboxEventType
  payload: Record<string, unknown>;
};

export class OutboxRepository {
  async create(input: CreateOutboxEventInput, tx?:any) {
     const [event] = await tx
       .insert(outboxEventsTable)
       .values({
         type: input.type,
         payload: input.payload,
         status: "PENDING",
       })
       .returning();

     if (!event) {
       throw new Error("Failed to create outbox event");
     }

     return event;
   }

}
