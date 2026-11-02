import {
  lessonRepo,
  authRepo,
  blockRepo,
  moduleRepo,
  OutboxRepo,
  verificationRepo,
  progressRepo,
} from "./repositories";
import { db } from "../Database";


import { lessonService } from "../../Modules/Lessons/lesson.service";
import { authServiceClass } from "../../Modules/Auth/auth.service";
import { BlockService } from "../../Modules/Block/block.service";
import { moduleService as ModuleService } from "../../Modules/Modules/module.service";
import { progressService as ProgressServiceClass } from "../../Modules/Progress/progress.service";



export const LessonService = new lessonService(
  db,
  lessonRepo,
  moduleRepo,
  blockRepo,
  authRepo,
  OutboxRepo
)

export const authService = new authServiceClass(
  authRepo,
  verificationRepo,
  OutboxRepo
)

export const blockService = new BlockService(
  blockRepo,
  authRepo,
  OutboxRepo
)

export const moduleService = new ModuleService(
  db,
  moduleRepo,
  authRepo,
  OutboxRepo
)

export const progressService = new ProgressServiceClass(
  progressRepo,
  blockRepo,
  lessonRepo,
  moduleRepo,
  authRepo
)