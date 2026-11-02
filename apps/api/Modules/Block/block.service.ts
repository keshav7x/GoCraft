import { blockRepositaryClass } from "./block.repositary";
import { authRepositoryClass } from "../Auth/auth.repositary";
import { OutboxRepository } from "../../Infra/OutBox/outbox.repo";
import { AppError } from "../../Infra/Error/errors";
import { db } from "../../Infra/Database";
import type { DBLessonBlockInsert, DBLessonBlock, BlockContentInput } from "./block.types";
import { validateBlockContent } from "./block.types";

function assertValidContent(type: string | null | undefined, content: unknown) {
  if (!type) return;
  try {
    validateBlockContent(type, content ?? {});
  } catch (err) {
    throw new AppError(err instanceof Error ? err.message : "Invalid block content", 400);
  }
}

export class BlockService {
  private Db = db;
  constructor(
    private readonly blockRepo :blockRepositaryClass,
    private readonly authRepo :authRepositoryClass,
    private readonly outBoxRepo : OutboxRepository
  ) {}

  public createBlock = async (
    userId: number,
    lessonId: number,
    input: DBLessonBlockInsert
  ): Promise<DBLessonBlock> => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!lessonId) throw new AppError("No lesson ID provided", 400);

    const block = await this.Db.transaction(async (tx:any) => {
      const isAdmin = await this.authRepo.isAdmin(userId, tx);
      if (!isAdmin) throw new AppError("Unauthorized access", 401);

      const lessonExists = await this.blockRepo.lessonExist(lessonId, tx);
      if (!lessonExists) throw new AppError("Target lesson not found", 404);

      assertValidContent(input.type, input.content);

      if (input.orderNo !== undefined) {
        await this.blockRepo.incrementOrderNumbers(lessonId, input.orderNo, tx);
      } else {
        const existingBlocks = await this.blockRepo.findBlocksByLessonId(lessonId, tx);
        input.orderNo = existingBlocks.length + 1;
      }

      const newBlock = await this.blockRepo.create(lessonId, input, tx);
      if (!newBlock) throw new AppError("Block could not be created", 400);

      await this.outBoxRepo.create({
        type: "LESSON_BLOCK_CREATED",
        payload: newBlock
      }, tx);

      return newBlock;
    });

    return block;
  };

  public addBlocksToLesson = async (
    userId: number,
    lessonId: number,
    blocks: BlockContentInput[]
  ): Promise<DBLessonBlock[]> => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!lessonId) throw new AppError("No lesson ID provided", 400);
    if (!blocks || blocks.length === 0) {
      throw new AppError("At least one block is required", 400);
    }

    const created = await this.Db.transaction(async (tx:any) => {
      const isAdmin = await this.authRepo.isAdmin(userId, tx);
      if (!isAdmin) throw new AppError("Unauthorized access", 401);

      const lessonExists = await this.blockRepo.lessonExist(lessonId, tx);
      if (!lessonExists) throw new AppError("Target lesson not found", 404);

      for (const block of blocks) {
        assertValidContent(block.type, block.content);
      }

      const baseOrderNo = await this.blockRepo.findMaxOrderNo(lessonId, tx);
      const rows = blocks.map((block, index) => ({
        ...block,
        lessonId,
        orderNo: block.orderNo ?? baseOrderNo + index + 1,
      }));

      const newBlocks = await this.blockRepo.createMany(rows, tx);
      if (!newBlocks || newBlocks.length === 0) {
        throw new AppError("Blocks could not be created", 400);
      }

      await this.outBoxRepo.create(
        {
          type: "LESSON_BLOCK_CREATED",
          payload: { lessonId, blockIds: newBlocks.map((b) => b.id) },
        },
        tx
      );

      return newBlocks;
    });

    return created;
  };

  public updateBlock = async (
    userId: number,
    blockId: number,
    input: Partial<DBLessonBlockInsert>
  ): Promise<DBLessonBlock> => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!blockId) throw new AppError("No block ID provided", 400);

    const updatedBlock = await this.Db.transaction(async (tx:any) => {
      const isAdmin = await this.authRepo.isAdmin(userId, tx);
      if (!isAdmin) throw new AppError("Unauthorized access", 401);

      const existingBlock = await this.blockRepo.findById(blockId, tx);
      if (!existingBlock) throw new AppError("Block not found", 404);

      if (input.content !== undefined) {
        assertValidContent(existingBlock.type, input.content);
      }

      if (input.orderNo !== undefined && input.orderNo !== existingBlock.orderNo) {
        await this.blockRepo.incrementOrderNumbers(existingBlock.lessonId, input.orderNo, tx);
      }

      const result = await this.blockRepo.update(blockId, input, tx);
      if (!result) throw new AppError("Block could not be updated", 400);

      await this.outBoxRepo.create(
        {
          type: "LESSON_BLOCK_UPDATED",
          payload: result,
        },
        tx
      );

      return result;
    });

    return updatedBlock;
  };

  public deleteBlock = async (userId: number, blockId: number): Promise<boolean> => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!blockId) throw new AppError("No block ID provided", 400);

    const success = await this.Db.transaction(async (tx:any) => {
      const isAdmin = await this.authRepo.isAdmin(userId, tx);
      if (!isAdmin) throw new AppError("Unauthorized access", 401);

      const existingBlock = await this.blockRepo.findById(blockId, tx);
      if (!existingBlock) throw new AppError("Block not found", 404);

      const deleted = await this.blockRepo.delete(blockId, tx);
      if (!deleted) throw new AppError("Block could not be deleted", 400);

      await this.outBoxRepo.create(
        {
          type: "LESSON_BLOCK_DELETED",
          payload: { id: blockId, lessonId: existingBlock.lessonId },
        },
        tx
      );

      return true;
    });

    return success;
  };

  public reorderBlocksInLesson = async (
    userId: number,
    lessonId: number,
    orderedBlockIds: number[]
  ): Promise<void> => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!lessonId) throw new AppError("No lesson ID provided", 400);
    if (!orderedBlockIds || orderedBlockIds.length === 0) {
      throw new AppError("Invalid block sequencing data", 400);
    }

    await this.Db.transaction(async (tx:any) => {
      const isAdmin = await this.authRepo.isAdmin(userId, tx);
      if (!isAdmin) throw new AppError("Unauthorized access", 401);

      const lessonBlocks = await this.blockRepo.findBlocksByLessonId(lessonId, tx);
      const lessonBlockIds = new Set(lessonBlocks.map((b) => b.id));

      const unknownId = orderedBlockIds.find((id) => !lessonBlockIds.has(id));
      if (unknownId !== undefined) {
        throw new AppError(`Block ${unknownId} does not belong to this lesson`, 400);
      }
      if (orderedBlockIds.length !== lessonBlocks.length) {
        throw new AppError("orderedBlockIds must contain every block of the lesson exactly once", 400);
      }

      for (let i = 0; i < orderedBlockIds.length; i++) {
        await this.blockRepo.update(orderedBlockIds[i]!, { orderNo: i + 1 }, tx);
      }

      await this.outBoxRepo.create(
        {
          type: "LESSON_BLOCKS_REORDERED",
          payload: { lessonId, orderedBlockIds },
        },
        tx
      );
    });
  };

  public getBlocksByLesson = async (userId: number, lessonId: number): Promise<DBLessonBlock[]> => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!lessonId) throw new AppError("No lesson ID provided", 400);

    return await this.blockRepo.findBlocksByLessonId(lessonId);
  };

  /**
   * Atomic bulk save for the lesson editor: replaces the full ordered block
   * list. Blocks with an `id` are updated in place (identity preserved);
   * blocks without an id are inserted; existing blocks absent from the list
   * are deleted. All-or-nothing inside one transaction.
   */
  public saveBlocks = async (
    userId: number,
    lessonId: number,
    blocks: Array<{
      id?: number;
      type: string;
      content: Record<string, unknown>;
      problemId?: number | null;
    }>
  ): Promise<DBLessonBlock[]> => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!lessonId) throw new AppError("No lesson ID provided", 400);
    if (!Array.isArray(blocks)) throw new AppError("Blocks array required", 400);

    for (const block of blocks) {
      assertValidContent(block.type, block.content);
    }

    return await this.Db.transaction(async (tx:any) => {
      const isAdmin = await this.authRepo.isAdmin(userId, tx);
      if (!isAdmin) throw new AppError("Unauthorized access", 401);

      const lessonExists = await this.blockRepo.lessonExist(lessonId, tx);
      if (!lessonExists) throw new AppError("Target lesson not found", 404);

      const existing = await this.blockRepo.findBlocksByLessonId(lessonId, tx);
      const existingIds = new Set(existing.map((b) => b.id));
      const keptIds = new Set(
        blocks.filter((b) => b.id !== undefined).map((b) => b.id as number)
      );

      for (const old of existing) {
        if (!keptIds.has(old.id)) {
          await this.blockRepo.delete(old.id, tx);
        }
      }

      const result: DBLessonBlock[] = [];
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i]!;
        const payload = {
          type: block.type,
          content: block.content,
          problemId: block.problemId ?? null,
          orderNo: i + 1,
          updatedAt: new Date(),
        };
        if (block.id !== undefined && existingIds.has(block.id)) {
          const updated = await this.blockRepo.update(block.id, payload, tx);
          if (updated) result.push(updated);
        } else {
          const created = await this.blockRepo.create(lessonId, payload, tx);
          result.push(created);
        }
      }

      await this.outBoxRepo.create(
        {
          type: "LESSON_BLOCKS_SAVED",
          payload: { lessonId, count: result.length },
        },
        tx
      );

      return result;
    });
  };
}
