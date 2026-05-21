"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getStudy } from "@/lib/api/studies";
import { getMyProgress } from "@/lib/api/assignments";

const statusLabel: Record<string, string> = {
  APPLIED: "진행 중",
  COMPLETED: "완료",
};

const statusCls: Record<string, string> = {
  APPLIED: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
};

export default function MyProgressPage({
  params,
}: {
  params: Promise<{ studyId: string }>;
}) {
  const { studyId } = use(params);
  const id = Number(studyId);

  const { data: study } = useQuery({
    queryKey: ["studies", id],
    queryFn: () => getStudy(id),
    enabled: !Number.isNaN(id),
  });

  const { data: progress = [], isPending } = useQuery({
    queryKey: ["studies", id, "progress", "me"],
    queryFn: () => getMyProgress(id),
    enabled: !Number.isNaN(id),
  });

  const completedCount = progress.filter((p) => p.status === "COMPLETED").length;

  return (
    <div>
      <nav className="flex items-center gap-1 text-sm text-[var(--on-surface)]/50">
        <Link href="/studies" className="hover:text-[var(--on-surface)] transition-colors">스터디</Link>
        <span>/</span>
        <Link href={`/studies/${id}`} className="hover:text-[var(--on-surface)] transition-colors">
          {study?.name ?? "상세"}
        </Link>
        <span>/</span>
        <span className="text-[var(--on-surface)] font-medium">내 진행현황</span>
      </nav>

      <div className="mt-6 flex items-center justify-between">
        <h1 className="ui-title">내 진행현황</h1>
        {progress.length > 0 && (
          <span className="text-label text-[var(--ui-text-subtle)]">
            신청 {progress.length}개 · 완료 {completedCount}개
          </span>
        )}
      </div>

      {isPending ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--surface-container-high)] border-t-[var(--primary)]" role="status" aria-label="로딩 중" />
        </div>
      ) : progress.length === 0 ? (
        <div className="ui-card-static mt-6 p-12 text-center">
          <p className="text-[var(--ui-text-muted)]">신청한 과제가 없습니다.</p>
          <Link
            href={`/studies/${id}/assignments`}
            className="mt-3 inline-block text-sm font-medium text-[var(--primary)] hover:opacity-70 transition-opacity"
          >
            과제 목록 보기 →
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {progress.map((p) => (
            <li
              key={p.progressId}
              className="ui-card p-5"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--surface-container-low)] text-xs font-bold text-[var(--on-surface)]/60">
                  {p.orderInStudy}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/studies/${id}/assignments/${p.assignmentId}`}
                      className="font-medium text-[var(--ui-text)] hover:text-[var(--primary)] transition-colors"
                    >
                      {p.title}
                    </Link>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCls[p.status]}`}>
                      {statusLabel[p.status]}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-label text-[var(--on-surface)]/50">
                    <span>신청일: {new Date(p.appliedAt).toLocaleDateString("ko-KR")}</span>
                    {p.completedAt ? (
                      <span>완료일: {new Date(p.completedAt).toLocaleDateString("ko-KR")}</span>
                    ) : (
                      <span className="text-[var(--on-surface)]/40">미완료</span>
                    )}
                    {p.githubIssueNumber && (
                      <span className="inline-flex items-center gap-1">
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                        Issue #{p.githubIssueNumber}
                      </span>
                    )}
                  </div>
                </div>
                {p.status === "COMPLETED" && (
                  <div className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-green-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
