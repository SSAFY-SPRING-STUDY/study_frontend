"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getNotices } from "@/lib/api/notices";

export default function NoticeListPage() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || 0);
  const size = 10;

  const { data, isPending, isError } = useQuery({
    queryKey: ["notices", page, size],
    queryFn: () => getNotices({ page, size }),
  });

  if (isPending) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" role="status" aria-label="로딩 중" />
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-red-600">공지사항 목록을 불러오지 못했습니다.</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">공지사항</h1>
        <p className="mt-1 text-sm text-gray-600">중요한 안내와 소식을 확인하세요.</p>
      </div>
      {data.empty ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">등록된 공지가 없습니다.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {data.content.map((n) => (
            <li key={n.id}>
              <Link
                href={`/notices/${n.id}`}
                className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-semibold text-gray-900">{n.title}</h2>
                  <span className="shrink-0 text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {n.content}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm text-gray-500">
          전체 {data.totalElements}개
        </span>
        <div className="flex gap-2">
          {!data.first && (
            <Link
              href={`/notices?page=${page - 1}`}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ← 이전
            </Link>
          )}
          {!data.last && (
            <Link
              href={`/notices?page=${page + 1}`}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              다음 →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
