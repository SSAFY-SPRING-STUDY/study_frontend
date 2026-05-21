import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import StudiesClient from "./StudiesClient";
import type { StudyType } from "@/lib/types/study";
import { cookies } from "next/headers";
import { API_V1_BASE } from "@/lib/env";

async function fetchStudiesServer(studyType: string, page: number, size: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access-token")?.value;
  
  const res = await fetch(`${API_V1_BASE}/studies?studyType=${studyType}&page=${page}&size=${size}`, {
    headers: {
      Cookie: token ? `access-token=${token}` : "",
    },
    // 최신 데이터를 자주 노출해야 한다면 (예: 어드민이 관리 중인 데이터), 캐시 우회 사용
    cache: "no-store", 
  });
  
  if (!res.ok) {
    throw new Error("Failed to fetch studies data");
  }
  const json = await res.json();
  return json.data;
}

export default async function StudiesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const queryClient = new QueryClient();

  const sp = await searchParams;
  const studyType = (sp?.studyType as StudyType) || "BACKEND";
  const page = Number(sp?.page || 0);
  const size = 10;

  try {
    await queryClient.prefetchQuery({
      queryKey: ["studies", studyType, page, size],
      queryFn: () => fetchStudiesServer(studyType, page, size),
    });
  } catch {
    // API 에러 시 서버 컴포넌트에서는 크래시를 내지 않고
    // 클라이언트 쪽 Hydration 시 useQuery에서 다시 에러 처리가 되도록 무시
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudiesClient />
    </HydrationBoundary>
  );
}
