"use client";

import { create } from "zustand";
import { SEED_MEDIA, SEED_MODULES, SEED_USERS } from "./mock-data";
import {
  createBlock,
  slugify,
  uid,
  type AdminUser,
  type Block,
  type BlockType,
  type Lesson,
  type LessonInput,
  type MediaAsset,
  type Module,
  type ModuleInput,
  type PublishStatus,
} from "./types";

function now() {
  return new Date().toISOString();
}

function moveItem<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  if (item === undefined) return next;
  next.splice(to, 0, item);
  return next;
}

type CmsState = {
  modules: Module[];
  media: MediaAsset[];
  users: AdminUser[];

  createModule: (input: ModuleInput) => Module;
  updateModule: (moduleId: string, patch: Partial<Module>) => void;
  deleteModule: (moduleId: string) => void;
  setModuleStatus: (moduleId: string, status: PublishStatus) => void;
  reorderLessons: (moduleId: string, from: number, to: number) => void;

  createLesson: (moduleId: string, input: LessonInput) => Lesson | null;
  updateLesson: (moduleId: string, lessonId: string, patch: Partial<Lesson>) => void;
  deleteLesson: (moduleId: string, lessonId: string) => void;
  setLessonStatus: (moduleId: string, lessonId: string, status: PublishStatus) => void;

  addBlock: (moduleId: string, lessonId: string, type: BlockType, index?: number) => void;
  updateBlockData: (
    moduleId: string,
    lessonId: string,
    blockId: string,
    patch: Record<string, unknown>,
  ) => void;
  replaceBlockType: (moduleId: string, lessonId: string, blockId: string, type: BlockType) => void;
  deleteBlock: (moduleId: string, lessonId: string, blockId: string) => void;
  duplicateBlock: (moduleId: string, lessonId: string, blockId: string) => void;
  moveBlock: (moduleId: string, lessonId: string, from: number, to: number) => void;

  addMedia: (asset: MediaAsset) => void;
  deleteMedia: (mediaId: string) => void;
};

function mapModule(modules: Module[], moduleId: string, fn: (m: Module) => Module): Module[] {
  return modules.map((m) => (m.id === moduleId ? fn(m) : m));
}

function mapLesson(
  modules: Module[],
  moduleId: string,
  lessonId: string,
  fn: (l: Lesson) => Lesson,
): Module[] {
  return mapModule(modules, moduleId, (m) => ({
    ...m,
    lessons: m.lessons.map((l) => (l.id === lessonId ? fn(l) : l)),
  }));
}

export const useCmsStore = create<CmsState>((set, get) => ({
  modules: SEED_MODULES,
  media: SEED_MEDIA,
  users: SEED_USERS,

  createModule: (input) => {
    const cover = get().media.find((a) => a.id === input.coverImageId);
    const module: Module = {
      id: uid("mod"),
      title: input.title,
      description: input.description,
      coverImage: cover?.url ?? null,
      coverImageId: input.coverImageId,
      difficulty: input.difficulty,
      objectives: input.objectives,
      estimatedDuration: input.estimatedDuration,
      displayOrder: input.displayOrder,
      status: input.status,
      updatedAt: now(),
      lessons: [],
    };
    set((state) => ({ modules: [...state.modules, module] }));
    return module;
  },

  updateModule: (moduleId, patch) => {
    set((state) => ({
      modules: mapModule(state.modules, moduleId, (m) => {
        const next = { ...m, ...patch, updatedAt: now() };
        if (patch.coverImageId !== undefined) {
          const asset = get().media.find((a) => a.id === patch.coverImageId);
          next.coverImage = asset?.url ?? null;
        }
        return next;
      }),
    }));
  },

  deleteModule: (moduleId) => {
    set((state) => ({ modules: state.modules.filter((m) => m.id !== moduleId) }));
  },

  setModuleStatus: (moduleId, status) => {
    get().updateModule(moduleId, { status });
  },

  reorderLessons: (moduleId, from, to) => {
    set((state) => ({
      modules: mapModule(state.modules, moduleId, (m) => ({
        ...m,
        updatedAt: now(),
        lessons: moveItem(m.lessons, from, to).map((l, i) => ({ ...l, displayOrder: i + 1 })),
      })),
    }));
  },

  createLesson: (moduleId, input) => {
    const existing = get().modules.find((m) => m.id === moduleId);
    if (!existing) return null;
    const lesson: Lesson = {
      id: uid("les"),
      moduleId,
      title: input.title,
      description: input.description,
      slug: input.slug || slugify(input.title) || "untitled-lesson",
      estimatedDuration: input.estimatedDuration,
      difficulty: input.difficulty,
      displayOrder: input.displayOrder ?? existing.lessons.length + 1,
      status: input.status,
      updatedAt: now(),
      blocks: [createBlock("paragraph")],
    };
    set((state) => ({
      modules: mapModule(state.modules, moduleId, (m) => ({
        ...m,
        updatedAt: now(),
        lessons: [...m.lessons, lesson],
      })),
    }));
    return lesson;
  },

  updateLesson: (moduleId, lessonId, patch) => {
    set((state) => ({
      modules: mapLesson(state.modules, moduleId, lessonId, (l) => ({
        ...l,
        ...patch,
        updatedAt: now(),
      })),
    }));
  },

  deleteLesson: (moduleId, lessonId) => {
    set((state) => ({
      modules: mapModule(state.modules, moduleId, (m) => ({
        ...m,
        updatedAt: now(),
        lessons: m.lessons.filter((l) => l.id !== lessonId),
      })),
    }));
  },

  setLessonStatus: (moduleId, lessonId, status) => {
    get().updateLesson(moduleId, lessonId, { status });
  },

  addBlock: (moduleId, lessonId, type, index) => {
    const block = createBlock(type);
    set((state) => ({
      modules: mapLesson(state.modules, moduleId, lessonId, (l) => {
        const blocks = [...l.blocks];
        const at = index ?? blocks.length;
        blocks.splice(at, 0, block);
        return { ...l, blocks, updatedAt: now() };
      }),
    }));
  },

  updateBlockData: (moduleId, lessonId, blockId, patch) => {
    set((state) => ({
      modules: mapLesson(state.modules, moduleId, lessonId, (l) => ({
        ...l,
        updatedAt: now(),
        blocks: l.blocks.map((b) =>
          b.id === blockId ? ({ ...b, data: { ...b.data, ...patch } } as Block) : b,
        ),
      })),
    }));
  },

  replaceBlockType: (moduleId, lessonId, blockId, type) => {
    set((state) => ({
      modules: mapLesson(state.modules, moduleId, lessonId, (l) => ({
        ...l,
        updatedAt: now(),
        blocks: l.blocks.map((b) =>
          b.id === blockId ? ({ id: b.id, type, data: createBlock(type).data } as Block) : b,
        ),
      })),
    }));
  },

  deleteBlock: (moduleId, lessonId, blockId) => {
    set((state) => ({
      modules: mapLesson(state.modules, moduleId, lessonId, (l) => ({
        ...l,
        updatedAt: now(),
        blocks: l.blocks.filter((b) => b.id !== blockId),
      })),
    }));
  },

  duplicateBlock: (moduleId, lessonId, blockId) => {
    set((state) => ({
      modules: mapLesson(state.modules, moduleId, lessonId, (l) => {
        const index = l.blocks.findIndex((b) => b.id === blockId);
        if (index < 0) return l;
        const source = l.blocks[index]!;
        const copy = {
          id: uid("blk"),
          type: source.type,
          data: JSON.parse(JSON.stringify(source.data)),
        } as Block;
        const blocks = [...l.blocks];
        blocks.splice(index + 1, 0, copy);
        return { ...l, blocks, updatedAt: now() };
      }),
    }));
  },

  moveBlock: (moduleId, lessonId, from, to) => {
    set((state) => ({
      modules: mapLesson(state.modules, moduleId, lessonId, (l) => ({
        ...l,
        updatedAt: now(),
        blocks: moveItem(l.blocks, from, to),
      })),
    }));
  },

  addMedia: (asset) => {
    set((state) => ({ media: [asset, ...state.media] }));
  },

  deleteMedia: (mediaId) => {
    set((state) => ({ media: state.media.filter((m) => m.id !== mediaId) }));
  },
}));

export function useModule(moduleId: string | undefined) {
  return useCmsStore((state) => state.modules.find((m) => m.id === moduleId));
}

export function useLesson(moduleId: string | undefined, lessonId: string | undefined) {
  return useCmsStore((state) =>
    state.modules.find((m) => m.id === moduleId)?.lessons.find((l) => l.id === lessonId),
  );
}

export function allLessons(modules: Module[]): { module: Module; lesson: Lesson }[] {
  return modules.flatMap((m) => m.lessons.map((l) => ({ module: m, lesson: l })));
}

export function findModule(modules: Module[], id: string) {
  return modules.find((m) => m.id === id);
}

export function findLesson(modules: Module[], moduleId: string, lessonId: string) {
  return modules.find((m) => m.id === moduleId)?.lessons.find((l) => l.id === lessonId);
}
