import { redirect } from "next/navigation";

export default async function LessonRedirectPage({
  params,
}: {
  params: Promise<{ moduleId: string; lessonId: string }>;
}) {
  const { moduleId, lessonId } = await params;
  redirect(`/modules/${moduleId}/${lessonId}`);
}
