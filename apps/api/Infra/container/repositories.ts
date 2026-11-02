//repositaries
import { LessonRepository } from "../../Modules/Lessons/lesson.repositary";
import { authRepositoryClass } from "../../Modules/Auth/auth.repositary";
import { blockRepositaryClass } from "../../Modules/Block/block.repositary";
import { ModuleRepository } from "../../Modules/Modules/module.repositary";
import { OutboxRepository } from "../OutBox/outbox.repo";
import { lessonService } from "../../Modules/Lessons/lesson.service";
import { VerificationRepositoryClass } from "../../Modules/verification/verification.repo";
import { db } from "../Database";
export const lessonRepo = new LessonRepository(db)
export const authRepo = new authRepositoryClass(db)
export const blockRepo = new blockRepositaryClass(db)
export const moduleRepo = new ModuleRepository(db)
export const OutboxRepo = new OutboxRepository()
export const verificationRepo=new VerificationRepositoryClass(db)