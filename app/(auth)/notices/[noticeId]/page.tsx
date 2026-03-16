"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getNotice } from "@/lib/api/notices";
import { MarkdownContent } from "@/components/ui/MarkdownContent";


export default function NoticeDetailPage({
  params,
}: {
  params: Promise<{ noticeId: string }>;
}) {
  const { noticeId } = use(params);
  const id = Number(noticeId);

  const { data: notice, isPending, isError } = useQuery({
    queryKey: ["notices", id],
    queryFn: () => getNotice(id),
    enabled: !Number.isNaN(id),
  });

  if (Number.isNaN(id) || isError || (!isPending && !notice)) {
    return (
      <div>
        <p className="text-gray-500">공지사항을 찾을 수 없습니다.</p>
        <Link href="/notices" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">
          목록으로
        </Link>
      </div>
    );
  }

  if (isPending || !notice) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" role="status" aria-label="로딩 중" />
      </div>
    );
  }

  return (
    <article className="max-w-3xl">
      <Link href="/notices" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
        ← 공지사항 목록
      </Link>
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          {notice.title}
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          {new Date(notice.createdAt).toLocaleDateString("ko-KR")}
        </p>
        <div className="mt-6 border-t border-gray-100 pt-6">
          <MarkdownContent content={notice.content} />
        </div>
      </div>
    </article>
  );
}
