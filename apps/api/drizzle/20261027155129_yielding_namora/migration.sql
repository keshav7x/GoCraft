CREATE TABLE "outbox_events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "outbox_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"aggregateType" varchar(255) NOT NULL,
	"aggregateId" varchar(255) NOT NULL,
	"payload" jsonb NOT NULL,
	"status" "outbox_status" DEFAULT 'pending'::"outbox_status" NOT NULL,
	"retryCount" integer DEFAULT 0 NOT NULL,
	"errorReason" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"processedAt" timestamp with time zone
);
