import { blockRepositaryClass } from "./block.repositary";
import { authRepositoryClass } from "../Auth/auth.repositary";
import { OutboxRepository } from "../../Infra/OutBox/outbox.repo";
import { AppError } from "../../Infra/Error/errors";
import { db } from "../../Infra/Database";
import type { DBLessonBlockInsert, DBLessonBlock } from "./block.types";

export class BlockService {
  private Db = db;
  constructor(
    private readonly blockRepo = new blockRepositaryClass(),
    private readonly authRepo = new authRepositoryClass(db),
    private readonly outBoxRepo = new OutboxRepository()
  ) {}

  public createBlock = async (
    userId: number,
    lessonId: number,
    input: DBLessonBlockInsert
  ): Promise<DBLessonBlock> => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!lessonId) throw new AppError("No lesson ID provided", 400);

    const block = await this.Db.transaction(async (tx) => {
      const isAdmin = await this.authRepo.isAdmin(userId, tx);
      if (!isAdmin) throw new AppError("Unauthorized access", 401);

      const lessonExists = await this.blockRepo.lessonExist(lessonId, tx);
      if (!lessonExists) throw new AppError("Target lesson not found", 404);

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

  public updateBlock = async (
    userId: number,
    blockId: number,
    input: Partial<DBLessonBlockInsert>
  ): Promise<DBLessonBlock> => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!blockId) throw new AppError("No block ID provided", 400);

    const updatedBlock = await this.Db.transaction(async (tx) => {
      const isAdmin = await this.authRepo.isAdmin(userId, tx);
      if (!isAdmin) throw new AppError("Unauthorized access", 401);

      const existingBlock = await this.blockRepo.findById(blockId, tx);
      if (!existingBlock) throw new AppError("Block not found", 404);

      const result = await this.blockRepo.update(blockId, input, tx);
      if (!result) throw new AppError("Block could not be updated", 400);

      await this.outBoxRepo.create({
        type: "LESSON_BLOCK_UPDATED",
        payload: result
      }, tx);

      return result;
    });

    return updatedBlock;
  };

  public deleteBlock = async (userId: number, blockId: number): Promise<boolean> => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!blockId) throw new AppError("No block ID provided", 400);

    const success = await this.Db.transaction(async (tx) => {
      const isAdmin = await this.authRepo.isAdmin(userId, tx);
      if (!isAdmin) throw new AppError("Unauthorized access", 401);

      const existingBlock = await this.blockRepo.findById(blockId, tx);
      if (!existingBlock) throw new AppError("Block not found", 404);

      const deleted = await this.blockRepo.delete(blockId, tx);
      if (!deleted) throw new AppError("Block could not be deleted", 400);

      await this.outBoxRepo.create({
        type: "LESSON_BLOCK_DELETED",
        payload: { id: blockId, lessonId: existingBlock.lessonId }
      }, tx);

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

    await this.Db.transaction(async (tx) => {
      const isAdmin = await this.authRepo.isAdmin(userId, tx);
      if (!isAdmin) throw new AppError("Unauthorized access", 401);

      const lessonExists = await this.blockRepo.lessonExist(lessonId, tx);
      if (!lessonExists) throw new AppError("Lesson not found", 404);

      for (let i = 0; i < orderedBlockIds.length; i++) {
        const blockId = orderedBlockIds[i];
        const newOrderNo = i + 1;
        await this.blockRepo.update(blockId!, { orderNo: newOrderNo }, tx);
      }

      await this.outBoxRepo.create({
        type: "LESSON_BLOCKS_REORDERED",
        payload: { lessonId, orderedBlockIds }
      }, tx);
    });
  };

  public getBlocksByLesson = async (userId: number, lessonId: number): Promise<DBLessonBlock[]> => {
    if (!userId) throw new AppError("Unauthorized access", 401);
    if (!lessonId) throw new AppError("No lesson ID provided", 400);

    return await this.blockRepo.findBlocksByLessonId(lessonId);
  };
}
