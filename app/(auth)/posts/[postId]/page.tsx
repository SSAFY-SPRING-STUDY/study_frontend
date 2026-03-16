import { redirect } from "next/navigation";

// URL이 /studies/[studyId]/posts/[postId] 로 이전되었습니다.
// studyId 없이 직접 접근 시 스터디 목록으로 이동합니다.
export default function OldPostRoute() {
  redirect("/studies");
}
