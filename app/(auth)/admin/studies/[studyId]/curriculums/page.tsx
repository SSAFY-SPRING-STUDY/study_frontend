import { redirect } from "next/navigation";

export default async function AdminCurriculumsRedirect({
  params,
}: {
  params: Promise<{ studyId: string }>;
}) {
  const { studyId } = await params;
  redirect(`/studies/${studyId}/curriculums`);
}
