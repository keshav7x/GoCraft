ALTER TABLE "users" RENAME COLUMN "isPremiumUser" TO "userType";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "userType" SET DATA TYPE user_type USING "userType"::user_type;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "userType" SET DEFAULT 'user'::"user_type";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "userType" SET NOT NULL;