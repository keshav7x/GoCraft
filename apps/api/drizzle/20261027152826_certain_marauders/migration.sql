CREATE TABLE "xp_events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "xp_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"type" "xp_event_type" NOT NULL,
	"amount" integer NOT NULL,
	"sourceId" varchar(255) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "xp" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "xp_events_user_type_source_unique" ON "xp_events" ("userId","type","sourceId");--> statement-breakpoint
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id");