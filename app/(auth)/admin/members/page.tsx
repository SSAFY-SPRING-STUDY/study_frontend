"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getAdminMembers } from "@/lib/api/adminMembers";
import type { MemberRole, MemberLevel } from "@/lib/types/member";

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
  BASIC: "bg-gray-100 text-gray-700",
  INTERMEDIATE: "bg-blue-100 text-blue-700",
  ADVANCED: "bg-indigo-100 text-indigo-700",
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
          <h1 className="text-2xl font-bold text-gray-900">회원 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            전체 {data?.totalElements ?? "-"}명
          </p>
        </div>
        <Link
          href="/admin"
          className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
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
          className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          검색
        </button>
      </form>

      {/* 테이블 */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isPending ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" role="status" aria-label="로딩 중" />
          </div>
        ) : !data?.content.length ? (
          <div className="py-12 text-center text-sm text-gray-500">
            {keyword ? "검색 결과가 없습니다." : "등록된 회원이 없습니다."}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">이메일</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">이름</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">닉네임</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">레벨</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">권한</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.content.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400">{m.id}</td>
                  <td className="px-4 py-3 text-gray-900">{m.email}</td>
                  <td className="px-4 py-3 text-gray-700">{m.name}</td>
                  <td className="px-4 py-3 text-gray-700">{m.nickName}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${LEVEL_COLOR[m.level]}`}>
                      {LEVEL_LABEL[m.level]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      m.role === "ROLE_ADMIN"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {ROLE_LABEL[m.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/members/${m.id}`}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
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
      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            이전
          </button>
          <span className="text-sm text-gray-600">
            {page + 1} / {data.totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={page + 1 >= data.totalPages}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
