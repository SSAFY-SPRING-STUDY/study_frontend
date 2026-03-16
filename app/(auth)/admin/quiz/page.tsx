"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getStudies } from "@/lib/api/studies";
import { getCurriculumsByStudy } from "@/lib/api/curriculums";
import { getPostsByCurriculum } from "@/lib/api/posts";
import { STUDY_TYPES, TYPE_LABEL, LEVEL_LABEL } from "@/lib/constants";
import type { StudyType } from "@/lib/types/study";

export default function AdminQuizPage() {
  const [studyType, setStudyType] = useState<StudyType>("BACKEND");
  const [selectedStudyId, setSelectedStudyId] = useState<number | null>(null);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<number | null>(null);

  const { data: studiesPage } = useQuery({
    queryKey: ["studies", studyType, 0, 100],
    queryFn: () => getStudies({ studyType, page: 0, size: 100 }),
  });

  const { data: curriculums = [] } = useQuery({
    queryKey: ["studies", selectedStudyId, "curriculums"],
    queryFn: () => getCurriculumsByStudy(selectedStudyId!),
    enabled: selectedStudyId != null,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["curriculums", selectedCurriculumId, "posts"],
    queryFn: () => getPostsByCurriculum(selectedCurriculumId!),
    enabled: selectedCurriculumId != null,
  });

  const studies = studiesPage?.content ?? [];

  function handleStudySelect(id: number) {
    setSelectedStudyId(id);
    setSelectedCurriculumId(null);
  }

  return (
    <div>
      <nav className="flex items-center gap-1 text-sm text-gray-500">
        <Link href="/admin" className="hover:text-gray-900 transition-colors">관리자</Link>
        <span>/</span>
        <span className="font-medium text-gray-900">퀴즈 응시 현황</span>
      </nav>

      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">퀴즈 응시 현황</h1>
        <p className="mt-1 text-sm text-gray-600">스터디 → 커리큘럼 → 게시글 순으로 선택하여 응시 현황을 확인하세요.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 스터디 선택 */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">스터디</p>
            <div className="mt-2 flex gap-1">
              {STUDY_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setStudyType(t); setSelectedStudyId(null); setSelectedCurriculumId(null); }}
                  className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                    studyType === t
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {TYPE_LABEL[t]}
                </button>
              ))}
            </div>
          </div>
          <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {studies.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-gray-400">스터디가 없습니다.</li>
            ) : (
              studies.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => handleStudySelect(s.id)}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                      selectedStudyId === s.id
                        ? "bg-indigo-50 font-medium text-indigo-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="block truncate">{s.name}</span>
                    <span className="mt-0.5 block text-xs text-gray-400">{LEVEL_LABEL[s.level]}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* 커리큘럼 선택 */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">커리큘럼</p>
          </div>
          <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {!selectedStudyId ? (
              <li className="px-4 py-6 text-center text-sm text-gray-400">스터디를 선택하세요.</li>
            ) : curriculums.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-gray-400">커리큘럼이 없습니다.</li>
            ) : (
              curriculums.map((c, idx) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedCurriculumId(c.id)}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                      selectedCurriculumId === c.id
                        ? "bg-indigo-50 font-medium text-indigo-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                      {idx + 1}
                    </span>
                    <span className="truncate">{c.title}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* 게시글 선택 */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">게시글</p>
          </div>
          <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {!selectedCurriculumId ? (
              <li className="px-4 py-6 text-center text-sm text-gray-400">커리큘럼을 선택하세요.</li>
            ) : posts.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-gray-400">게시글이 없습니다.</li>
            ) : (
              posts.map((p) => (
                <li key={p.postId}>
                  <Link
                    href={`/admin/quiz/${p.postId}`}
                    className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                        {p.orderInCurriculum}
                      </span>
                      <span className="truncate">{p.title}</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4 shrink-0 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
