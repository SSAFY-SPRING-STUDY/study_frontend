"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getAdminMembers } from "@/lib/api/adminMembers";
import type { MemberRole, MemberLevel } from "@/lib/types/member";
import { Button } from "@/components/ui/Button";

const ROLE_LABEL: Record<MemberRole, string> = {
  ROLE_USER: "일반",
  ROLE_ADMIN: "관리자",
};

const LEVEL_LABEL: Record<MemberLevel, string> = {
  BASIC: "BASIC",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED",
};

const LEVEL_COLOR: Record<MemberLevel, string> = {
  BASIC: "bg-[var(--surface-container-low)] text-[var(--on-surface)]/70",
  INTERMEDIATE: "bg-blue-100 text-blue-700",
  ADVANCED: "bg-[var(--primary)]/10 text-[var(--primary)]",
};

export default function AdminMembersPage() {
  const [keyword, setKeyword] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [page, setPage] = useState(0);

  const { data, isPending } = useQuery({
    queryKey: ["admin", "members", keyword, page],
    queryFn: () => getAdminMembers({ keyword: keyword || undefined, page, size: 20 }),
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(0);
    setKeyword(inputValue);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-headline-md text-[var(--on-surface)]">회원 관리</h1>
          <p className="mt-1 text-label text-[var(--on-surface)]/50">
            전체 {data?.page.totalElements ?? "-"}명
          </p>
        </div>
        <Link
          href="/admin"
          className="text-sm text-[var(--on-surface)]/50 hover:text-[var(--on-surface)] transition-colors"
        >
          ← 관리자 홈
        </Link>
      </div>

      {/* 검색 */}
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="이메일 또는 닉네임 검색"
          className="ui-field flex-1"
        />
        <Button type="submit" variant="primary">
          검색
        </Button>
      </form>

      {/* 테이블 */}
      <div className="overflow-hidden rounded-xl bg-[var(--surface-container-lowest)] shadow-ambient">
        {isPending ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--surface-container-high)] border-t-[var(--primary)]" role="status" aria-label="로딩 중" />
          </div>
        ) : !data?.content.length ? (
          <div className="py-12 text-center text-sm text-[var(--on-surface)]/50">
            {keyword ? "검색 결과가 없습니다." : "등록된 회원이 없습니다."}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface-container-low)]">
              <tr>
                <th className="px-4 py-3 text-left text-label text-[var(--on-surface)]/50 font-medium">ID</th>
                <th className="px-4 py-3 text-left text-label text-[var(--on-surface)]/50 font-medium">이메일</th>
                <th className="px-4 py-3 text-left text-label text-[var(--on-surface)]/50 font-medium">이름</th>
                <th className="px-4 py-3 text-left text-label text-[var(--on-surface)]/50 font-medium">닉네임</th>
                <th className="px-4 py-3 text-left text-label text-[var(--on-surface)]/50 font-medium">레벨</th>
                <th className="px-4 py-3 text-left text-label text-[var(--on-surface)]/50 font-medium">권한</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {data.content.map((m) => (
                <tr key={m.id} className="hover:bg-[var(--surface-container-low)] transition-colors">
                  <td className="px-4 py-3 text-label text-[var(--on-surface)]/40">{m.id}</td>
                  <td className="px-4 py-3 text-[var(--on-surface)]">{m.email}</td>
                  <td className="px-4 py-3 text-[var(--on-surface)]/80">{m.name}</td>
                  <td className="px-4 py-3 text-[var(--on-surface)]/80">{m.nickname}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${LEVEL_COLOR[m.level]}`}>
                      {LEVEL_LABEL[m.level]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      m.role === "ROLE_ADMIN"
                        ? "bg-red-100 text-red-700"
                        : "bg-[var(--surface-container-low)] text-[var(--on-surface)]/60"
                    }`}>
                      {ROLE_LABEL[m.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/members/${m.id}`}
                      className="text-xs font-medium text-[var(--primary)] hover:underline"
                    >
                      수정
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 페이지네이션 */}
      {data && data.page.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            className="ui-btn ui-btn-surface px-3 py-1.5 text-sm disabled:opacity-40"
          >
            이전
          </button>
          <span className="text-sm text-[var(--on-surface)]/60">
            {page + 1} / {data.page.totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={page + 1 >= data.page.totalPages}
            className="ui-btn ui-btn-surface px-3 py-1.5 text-sm disabled:opacity-40"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
