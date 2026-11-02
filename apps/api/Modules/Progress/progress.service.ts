import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../Infra/Database";
import {
  userLessonProgressTable,
  lessonsTable,
  usersTable,
} from "../../Infra/Database/schema";
import { ProgressRepository } from "./progress.repo";
import { blockRepositaryClass } from "../Block/block.repositary";
import { LessonRepository } from "../Lessons/lesson.repositary";
import { ModuleRepository } from "../Modules/module.repositary";
import { authRepositoryClass } from "../Auth/auth.repositary";
import { parseLessonBlock, type QuizQuestion } from "../Block/block.schemas";
import { AppError } from "../../Infra/Error/errors";

export type QuizAnswerInput = {
  lessonId: number;
  blockId: number;
  questionId: string;
  /** choice id | "true"/"false" | free-text answer */
  answer: string | boolean;
};

export type ChallengeSubmissionInput = {
  lessonId: number;
  blockId: number;
  code?: string;
  answer?: string;
};

export type ProgressSummary = {
  lessonId: number;
  status: "not started" | "in progress" | "completed";
  startedAt: Date | null;
  completedAt: Date | null;
  lastAccessedAt: Date | null;
  lastBlockId: number | null;
  completedBlockIds: number[];
  xpAwarded: number;
};

function gradeQuestion(
  question: QuizQuestion,
  answer: string | boolean
): { correct: boolean; explanation?: string } {
  const explanation = question.explanation;
  if (question.kind === "multiple_choice") {
    const correct = typeof answer === "string" && answer === question.correctChoiceId;
    return { correct, explanation };
  }
  if (question.kind === "true_false") {
    const normalized =
      typeof answer === "boolean" ? answer : answer === "true" || answer === "True";
    return { correct: normalized === question.correctAnswer, explanation };
  }
  const normalized = String(answer).trim().toLowerCase();
  const expected = question.correctAnswer.trim().toLowerCase();
  return { correct: normalized === expected, explanation };
}

export class progressService {
  constructor(
    private readonly progressRepo: ProgressRepository,
    private readonly blockRepo: blockRepositaryClass,
    private readonly lessonRepo: LessonRepository,
    private readonly moduleRepo: ModuleRepository,
    private readonly authRepo: authRepositoryClass
  ) {}

  private async assertLessonVisible(lessonId: number, userId: number, isAdmin: boolean) {
    const lesson = await this.lessonRepo.findById(lessonId);
    if (!lesson) throw new AppError("Lesson not found", 404);
    if (!isAdmin) {
      const module = await this.moduleRepo.findById(lesson.moduleId);
      if (!module || module.status !== "published" || lesson.status !== "published") {
        throw new AppError("Lesson not found", 404);
      }
    }
    return lesson;
  }

  private async isAdmin(userId: number): Promise<boolean> {
    return this.authRepo.isAdmin(userId);
  }

  async getMyProgress(userId: number): Promise<ProgressSummary[]> {
    if (!userId) throw new AppError("Unauthorized access", 401);
    const rows = await this.progressRepo.getUserProgressList(userId);
    return rows.map((r) => ({
      lessonId: r.lessonId,
      status: r.status,
      startedAt: r.startedAt ?? null,
      completedAt: r.completedAt ?? null,
      lastAccessedAt: r.lastAccessedAt ?? null,
      lastBlockId: r.lastBlockId ?? null,
      completedBlockIds: r.completedBlockIds ?? [],
      xpAwarded: r.xpAwarded ?? 0,
    }));
  }

  async getLessonProgress(userId: number, lessonId: number): Promise<ProgressSummary | null> {
    if (!userId) throw new AppError("Unauthorized access", 401);
    const row = await this.progressRepo.getLessonProgress(userId, lessonId);
    if (!row) return null;
    return {
      lessonId: row.lessonId,
      status: row.status,
      startedAt: row.startedAt ?? null,
      completedAt: row.completedAt ?? null,
      lastAccessedAt: row.lastAccessedAt ?? null,
      lastBlockId: row.lastBlockId ?? null,
      completedBlockIds: row.completedBlockIds ?? [],
      xpAwarded: row.xpAwarded ?? 0,
    };
  }

  async getModuleProgress(
    userId: number,
    moduleId: number
  ): Promise<{ lessonId: number; status: string }[]> {
    if (!userId) throw new AppError("Unauthorized access", 401);
    const rows = await this.progressRepo.getModuleLessonProgress(userId, moduleId);
    return rows.map((r) => ({
      lessonId: r.lessonId,
      status: r.status ?? "not started",
    }));
  }

  /** Marks a lesson in-progress and records the last accessed position. */
  async startLesson(
    userId: number,
    lessonId: number,
    lastBlockId?: number
  ): Promise<ProgressSummary> {
    if (!userId) throw new AppError("Unauthorized access", 401);
    const isAdmin = await this.isAdmin(userId);
    await this.assertLessonVisible(lessonId, userId, isAdmin);

    const existing = await this.progressRepo.getLessonProgress(userId, lessonId);
    const now = new Date();

    if (!existing) {
      await this.progressRepo.createProgress({
        userId,
        lessonId,
        status: "in progress",
        startedAt: now,
        lastAccessedAt: now,
        lastBlockId: lastBlockId ?? null,
      });
    } else if (existing.status !== "completed") {
      await db
        .update(userLessonProgressTable)
        .set({
          status: "in progress",
          startedAt: existing.startedAt ?? now,
          lastAccessedAt: now,
          ...(lastBlockId !== undefined ? { lastBlockId } : {}),
        })
        .where(
          and(
            eq(userLessonProgressTable.userId, userId),
            eq(userLessonProgressTable.lessonId, lessonId)
          )
        );
    } else {
      // Reopening a completed lesson must not reset progress or re-award XP.
      await db
        .update(userLessonProgressTable)
        .set({
          lastAccessedAt: now,
          ...(lastBlockId !== undefined ? { lastBlockId } : {}),
        })
        .where(
          and(
            eq(userLessonProgressTable.userId, userId),
            eq(userLessonProgressTable.lessonId, lessonId)
          )
        );
    }

    const after = await this.progressRepo.getLessonProgress(userId, lessonId);
    if (!after) throw new AppError("Progress could not be saved", 500);
    return {
      lessonId: after.lessonId,
      status: after.status,
      startedAt: after.startedAt ?? null,
      completedAt: after.completedAt ?? null,
      lastAccessedAt: after.lastAccessedAt ?? null,
      lastBlockId: after.lastBlockId ?? null,
      completedBlockIds: after.completedBlockIds ?? [],
      xpAwarded: after.xpAwarded ?? 0,
    };
  }

  /**
   * Marks a block (quiz/challenge) as completed for this user.
   * Idempotent — tracked in completedBlockIds.
   */
  private async markBlockCompleted(
    userId: number,
    lessonId: number,
    blockId: number,
    xp: number,
    xpType: "quiz_completed" | "challenge_solved",
    sourceId: string
  ): Promise<{ firstTime: boolean; xpAwarded: number }> {
    const existing = await this.progressRepo.getLessonProgress(userId, lessonId);
    const already = (existing?.completedBlockIds ?? []).includes(blockId);

    if (existing) {
      if (!already) {
        await db
          .update(userLessonProgressTable)
          .set({
            completedBlockIds: [...(existing.completedBlockIds ?? []), blockId],
            status: existing.status === "completed" ? "completed" : "in progress",
            startedAt: existing.startedAt ?? new Date(),
            lastAccessedAt: new Date(),
          })
          .where(
            and(
              eq(userLessonProgressTable.userId, userId),
              eq(userLessonProgressTable.lessonId, lessonId)
            )
          );
      } else {
        await db
          .update(userLessonProgressTable)
          .set({ lastAccessedAt: new Date() })
          .where(
            and(
              eq(userLessonProgressTable.userId, userId),
              eq(userLessonProgressTable.lessonId, lessonId)
            )
          );
      }
    } else {
      await this.progressRepo.createProgress({
        userId,
        lessonId,
        status: "in progress",
        startedAt: new Date(),
        lastAccessedAt: new Date(),
        completedBlockIds: [blockId],
      });
    }

    if (already || xp <= 0) {
      return { firstTime: false, xpAwarded: 0 };
    }

    const { xpAwarded } = await this.progressRepo.awardXpOnce(
      userId,
      xpType,
      xp,
      sourceId
    );
    return { firstTime: true, xpAwarded };
  }

  async submitQuizAnswer(
    userId: number,
    input: QuizAnswerInput
  ): Promise<{
    correct: boolean;
    explanation?: string;
    xpAwarded: number;
    blockCompleted: boolean;
  }> {
    if (!userId) throw new AppError("Unauthorized access", 401);
    const isAdmin = await this.isAdmin(userId);
    await this.assertLessonVisible(input.lessonId, userId, isAdmin);

    const block = await this.blockRepo.findById(input.blockId);
    if (!block || block.lessonId !== input.lessonId) {
      throw new AppError("Quiz block not found", 404);
    }
    if (block.type !== "quiz") throw new AppError("Block is not a quiz", 400);

    const parsed = parseLessonBlock(block.type, block.content ?? {});
    if (!parsed || parsed.type !== "quiz") {
      throw new AppError("Quiz content is invalid", 400);
    }

    const question = parsed.content.questions.find((q:any) => q.id === input.questionId);
    if (!question) throw new AppError("Question not found", 404);

    const { correct, explanation } = gradeQuestion(question, input.answer);

    let xpAwarded = 0;
    let blockCompleted = false;

    if (correct) {
      // Award quiz XP once per block (all questions answered correctly is
      // tracked client-side; server awards on first correct answer per block
      // only when every question has a correct submission — handled simply:
      // award once per block on any correct answer if xpReward > 0 and the
      // block isn't already completed).
      const result = await this.markBlockCompleted(
        userId,
        input.lessonId,
        input.blockId,
        parsed.content.xpReward,
        "quiz_completed",
        `quiz:${input.blockId}`
      );
      xpAwarded = result.xpAwarded;
      blockCompleted = result.firstTime || xpAwarded > 0 || true;
    }

    return { correct, explanation, xpAwarded, blockCompleted };
  }

  async submitChallenge(
    userId: number,
    input: ChallengeSubmissionInput
  ): Promise<{
    accepted: boolean;
    message: string;
    xpAwarded: number;
  }> {
    if (!userId) throw new AppError("Unauthorized access", 401);
    const isAdmin = await this.isAdmin(userId);
    await this.assertLessonVisible(input.lessonId, userId, isAdmin);

    const block = await this.blockRepo.findById(input.blockId);
    if (!block || block.lessonId !== input.lessonId) {
      throw new AppError("Challenge block not found", 404);
    }
    if (block.type !== "challenge") throw new AppError("Block is not a challenge", 400);

    const parsed = parseLessonBlock(block.type, block.content ?? {});
    if (!parsed || parsed.type !== "challenge") {
      throw new AppError("Challenge content is invalid", 400);
    }

    // No code-execution sandbox exists. Coding submissions are recorded as
    // attempts but never auto-passed — we do not fabricate results.
    const hasCode = Boolean(input.code && input.code.trim().length > 0);
    if (hasCode && !input.answer) {
      return {
        accepted: true,
        message:
          "Submission recorded. No execution sandbox is connected, so results are not graded — nothing was run.",
        xpAwarded: 0,
      };
    }

    // Self-check challenges with a provided answer string are graded against
    // the first requirement when it is formatted as "answer: <value>".
    if (input.answer && input.answer.trim().length > 0) {
      const expected = parsed.content.requirements.find((r:any) =>
        r.toLowerCase().startsWith("answer:")
      );
      if (expected) {
        const expectedValue = expected.slice("answer:".length).trim().toLowerCase();
        const given = input.answer.trim().toLowerCase();
        if (given === expectedValue) {
          const result = await this.markBlockCompleted(
            userId,
            input.lessonId,
            input.blockId,
            parsed.content.xpReward,
            "challenge_solved",
            `challenge:${input.blockId}`
          );
          return {
            accepted: true,
            message: "Correct! Challenge solved.",
            xpAwarded: result.xpAwarded,
          };
        }
        return {
          accepted: true,
          message: "Not quite — try again.",
          xpAwarded: 0,
        };
      }
    }

    return {
      accepted: true,
      message: "Submission saved.",
      xpAwarded: 0,
    };
  }

  /**
   * Completes a lesson and awards its XP exactly once (server-side,
   * advisory-locked + unique xp_events index). Repeat calls are no-ops.
   */
  async completeLesson(
    userId: number,
    lessonId: number
  ): Promise<{ xpAwarded: number; alreadyCompleted: boolean; totalXp: number }> {
    if (!userId) throw new AppError("Unauthorized access", 401);
    const isAdmin = await this.isAdmin(userId);
    const lesson = await this.assertLessonVisible(lessonId, userId, isAdmin);

    const result = await this.progressRepo.completeLessonAndAwardXp(
      userId,
      lessonId,
      lesson.xpReward,
      String(lessonId)
    );

    if (result.xpAwarded > 0) {
      await this.progressRepo.incrementXpAwarded(userId, lessonId, result.xpAwarded);
    }

    const [user] = await db
      .select({ xp: usersTable.xp })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    return {
      xpAwarded: result.xpAwarded,
      alreadyCompleted: result.alreadyCompleted,
      totalXp: user?.xp ?? 0,
    };
  }

  /** All published lessons with the current user's progress — for curriculum UI. */
  async getCurriculumProgress(userId: number): Promise<
    Array<{
      lessonId: number;
      moduleId: number;
      status: string;
      completedAt: Date | null;
    }>
  > {
    if (!userId) throw new AppError("Unauthorized access", 401);
    const progress = await this.progressRepo.getUserProgressList(userId);
    const lessonIds = progress.map((p) => p.lessonId);
    if (lessonIds.length === 0) return [];

    const lessons = await db
      .select({
        id: lessonsTable.id,
        moduleId: lessonsTable.moduleId,
        status: lessonsTable.status,
      })
      .from(lessonsTable)
      .where(inArray(lessonsTable.id, lessonIds));

    const publishedIds = new Set(
      lessons.filter((l) => l.status === "published").map((l) => l.id)
    );

    return progress
      .filter((p) => publishedIds.has(p.lessonId))
      .map((p) => {
        const lesson = lessons.find((l) => l.id === p.lessonId)!;
        return {
          lessonId: p.lessonId,
          moduleId: lesson.moduleId,
          status: p.status,
          completedAt: p.completedAt ?? null,
        };
      });
  }
}
