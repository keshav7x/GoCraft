import { notFound, redirect } from "next/navigation";
import { caller } from "@/trpc/server";
import { isAuthError } from "@/trpc/errors";
import { LessonView } from "@/app/components/learning/curriculum/LessonView";

export const metadata = {
  title: "Lesson — GoCraft",
};

export default async function LessonPage({
  params,
}: {
  params: Promise<{ moduleId: string; lessonId: string }>;
}) {
  const { moduleId: rawModule, lessonId: rawLesson } = await params;
  const moduleId = Number(rawModule);
  const lessonId = Number(rawLesson);
  if (!Number.isInteger(moduleId) || !Number.isInteger(lessonId)) notFound();

  let detail;
  let siblings;
  let progress;
  let modules;
  let allLessons;
  let curriculumProgress;
  try {
    [detail, siblings, progress, modules, allLessons, curriculumProgress] =
      await Promise.all([
        caller.lesson.getLessonById.query({ id: lessonId }),
        caller.lesson.getLessonsByModuleId.query({ moduleId }),
        caller.progress.getLessonProgress.query({ lessonId }),
        caller.module.getAllModulesWithStats.query(),
        caller.lesson.getAllLessons.query(),
        caller.progress.getCurriculumProgress.query(),
      ]);
  } catch (error) {
    if (isAuthError(error)) redirect("/login");
    throw error;
  }

  // Guard: lesson must belong to the module in the URL.
  if (detail.lesson.moduleId !== moduleId) notFound();

  return (
    <LessonView
      detail={detail}
      siblings={siblings}
      initialProgress={progress}
      modules={modules}
      allLessons={allLessons}
      curriculumProgress={curriculumProgress}
    />
  );
}
