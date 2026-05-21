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
        <p className="text-[var(--on-surface)]/50">공지사항을 찾을 수 없습니다.</p>
        <Link href="/notices" className="mt-4 inline-block text-sm text-[var(--primary)] hover:underline">
          목록으로
        </Link>
      </div>
    );
  }

  if (isPending || !notice) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--surface-container-high)] border-t-[var(--primary)]" role="status" aria-label="로딩 중" />
      </div>
    );
  }

  return (
    <article className="max-w-3xl">
      <Link href="/notices" className="text-sm text-[var(--on-surface)]/50 hover:text-[var(--on-surface)] transition-colors">
        ← 공지사항 목록
      </Link>
      <div className="ui-card mt-6 p-10">
        <h1 className="ui-title">
          {notice.title}
        </h1>
        <p className="mt-2 text-label text-[var(--ui-text-subtle)]">
          {new Date(notice.createdAt).toLocaleDateString("ko-KR")}
        </p>
        <div className="h-px bg-[var(--surface-container-high)] mt-8 mb-6" />
        <MarkdownContent content={notice.content} />
      </div>
    </article>
  );
}
