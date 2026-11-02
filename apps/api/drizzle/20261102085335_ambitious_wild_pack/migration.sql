CREATE TYPE "content_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
ALTER TYPE "xp_event_type" ADD VALUE 'quiz_completed';--> statement-breakpoint
ALTER TYPE "xp_event_type" ADD VALUE 'challenge_solved';--> statement-breakpoint
ALTER TABLE "lesson_blocks" ADD COLUMN "content" jsonb DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "lesson_blocks" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "lesson_blocks" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "slug" varchar(140);--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "description" varchar(1000);--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "learningObjectives" jsonb DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "status" "content_status" DEFAULT 'draft'::"content_status" NOT NULL;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "modules" ADD COLUMN "slug" varchar(120);--> statement-breakpoint
ALTER TABLE "modules" ADD COLUMN "shortDescription" varchar(300);--> statement-breakpoint
ALTER TABLE "modules" ADD COLUMN "coverImage" varchar(500);--> statement-breakpoint
ALTER TABLE "modules" ADD COLUMN "difficulty" varchar(20) DEFAULT 'beginner' NOT NULL;--> statement-breakpoint
ALTER TABLE "modules" ADD COLUMN "status" "content_status" DEFAULT 'draft'::"content_status" NOT NULL;--> statement-breakpoint
ALTER TABLE "modules" ADD COLUMN "estimatedDuration" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "modules" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "modules" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user_lesson_progress" ADD COLUMN "startedAt" timestamp;--> statement-breakpoint
ALTER TABLE "user_lesson_progress" ADD COLUMN "lastAccessedAt" timestamp;--> statement-breakpoint
ALTER TABLE "user_lesson_progress" ADD COLUMN "lastBlockId" integer;--> statement-breakpoint
ALTER TABLE "user_lesson_progress" ADD COLUMN "completedBlockIds" integer[] DEFAULT '{}'::integer[] NOT NULL;--> statement-breakpoint
ALTER TABLE "user_lesson_progress" ADD COLUMN "xpAwarded" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "lesson_blocks" ALTER COLUMN "type" SET DATA TYPE varchar(50) USING "type"::varchar(50);--> statement-breakpoint
UPDATE "modules" SET "status" = 'published' WHERE "status" = 'draft';--> statement-breakpoint
UPDATE "lessons" SET "status" = 'published' WHERE "status" = 'draft';--> statement-breakpoint
UPDATE "modules" SET "slug" = "id"::text WHERE "slug" IS NULL;--> statement-breakpoint
UPDATE "lessons" SET "slug" = "id"::text WHERE "slug" IS NULL;--> statement-breakpoint
UPDATE "lesson_blocks" SET "content" = CASE
  WHEN "type" IN ('h1','h2','h3','text','b','i') THEN jsonb_build_object('html', COALESCE("contentValue",''))
  WHEN "type" = 'code_example' THEN jsonb_build_object('code', COALESCE("contentValue",''), 'language', COALESCE("properties"->>'language','go'))
  WHEN "type" = 'image' THEN jsonb_build_object('src', COALESCE("contentValue",''), 'alt', COALESCE("properties"->>'altText',''), 'caption', COALESCE("properties"->>'caption',''))
  WHEN "type" = 'visual' THEN jsonb_build_object('visualizationType', 'execution-flow', 'title', COALESCE("contentValue",'Visual'), 'config', COALESCE("properties",'{}'::jsonb))
  ELSE COALESCE("properties",'{}'::jsonb)
END
WHERE "content" = '{}'::jsonb;--> statement-breakpoint
DELETE FROM "user_lesson_progress" a USING "user_lesson_progress" b
WHERE a."userId" = b."userId" AND a."lessonId" = b."lessonId" AND a."id" > b."id";--> statement-breakpoint
CREATE UNIQUE INDEX "lessons_module_slug_unique" ON "lessons" ("moduleId","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "modules_slug_unique" ON "modules" ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "user_lesson_progress_user_lesson_unique" ON "user_lesson_progress" ("userId","lessonId");
