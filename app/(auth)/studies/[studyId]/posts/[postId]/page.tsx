import { redirect } from "next/navigation";

// /studies/{studyId}/curriculums/{curriculumId}/posts/{postId} 로 이전되었습니다.
export default function OldPostRoute() {
  redirect("/studies");
}
