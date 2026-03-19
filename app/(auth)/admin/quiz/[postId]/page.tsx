"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getPost } from "@/lib/api/posts";
import { getQuizAttempts } from "@/lib/api/quiz";

const PAGE_SIZE = 20;

export default function AdminQuizAttemptsPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = use(params);
  const id = Number(postId);
  const [page, setPage] = useState(0);

  const { data: post } = useQuery({
    queryKey: ["posts", id],
    queryFn: () => getPost(id),
    enabled: !Number.isNaN(id),
  });

  const { data, isPending } = useQuery({
    queryKey: ["quiz-attempts-admin", id, page],
    queryFn: () => getQuizAttempts(id, { page, size: PAGE_SIZE }),
    enabled: !Number.isNaN(id),
  });

  const attempts = data?.content ?? [];

  if (Number.isNaN(id)) {
    return <p className="text-gray-500">잘못된 접근입니다.</p>;
  }

  return (
    <div>
      <nav className="flex items-center gap-1 text-sm text-gray-500">
        <Link href="/admin" className="hover:text-gray-900 transition-colors">관리자</Link>
        <span>/</span>
        <Link href="/admin/quiz" className="hover:text-gray-900 transition-colors">퀴즈 현황</Link>
        <span>/</span>
        <span className="font-medium text-gray-900 truncate max-w-xs">{post?.title ?? `게시글 #${id}`}</span>
      </nav>

      <div className="mt-4 mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">퀴즈 응시 현황</h1>
          {post && (
            <p className="mt-1 text-sm text-gray-600">{post.title}</p>
          )}
        </div>
        {data && (
          <div className="shrink-0 rounded-xl border border-gray-200 bg-white px-4 py-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-indigo-600">{data.page.totalElements}</p>
            <p className="mt-0.5 text-xs text-gray-500">총 응시자</p>
          </div>
        )}
      </div>

      {isPending ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" role="status" aria-label="로딩 중" />
        </div>
      ) : attempts.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">아직 응시한 회원이 없습니다.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">이름</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">닉네임</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">점수</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">합격 여부</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">응시일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {attempts.map((a, idx) => (
                <tr key={a.attemptId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400">{page * PAGE_SIZE + idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{a.memberName}</td>
                  <td className="px-4 py-3 text-gray-600">{a.memberNickname}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-semibold ${a.score >= 7 ? "text-emerald-600" : "text-red-500"}`}>
                      {a.score} / 10
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      a.passed
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {a.passed ? "합격" : "불합격"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(a.attemptedAt).toLocaleString("ko-KR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 페이지네이션 */}
      {(data?.page.totalPages ?? 0) > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {page + 1} / {data?.page.totalPages} 페이지
          </span>
          <div className="flex gap-2">
            {page > 0 && (
              <button
                type="button"
                onClick={() => setPage((p) => p - 1)}
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← 이전
              </button>
            )}
            {data && page + 1 < data.page.totalPages && (
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                다음 →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
