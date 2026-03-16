"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStudy, updateStudy, deleteStudy } from "@/lib/api/studies";
import { getCurriculumsByStudy } from "@/lib/api/curriculums";
import { useIsAdmin } from "@/store/auth-store";
import { LEVEL_LABEL, TYPE_LABEL } from "@/lib/constants";
import type { StudyLevel, StudyType } from "@/lib/types/study";
import { StudyForm } from "@/components/forms/StudyForm";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/lib/toast";

const levelBadgeCls: Record<string, string> = {
  BASIC: "bg-emerald-100 text-emerald-700",
  INTERMEDIATE: "bg-amber-100 text-amber-700",
  ADVANCED: "bg-red-100 text-red-700",
};

const typeBadgeCls: Record<string, string> = {
  BACKEND: "bg-blue-100 text-blue-700",
  COMPUTER_SCIENCE: "bg-violet-100 text-violet-700",
  ALGORITHM: "bg-orange-100 text-orange-700",
};

export default function StudyDetailPage({
  params,
}: {
  params: Promise<{ studyId: string }>;
}) {
  const { studyId } = use(params);
  const id = Number(studyId);
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: study, isPending, isError } = useQuery({
    queryKey: ["studies", id],
    queryFn: () => getStudy(id),
    enabled: !Number.isNaN(id),
  });

  const { data: curriculums = [] } = useQuery({
    queryKey: ["studies", id, "curriculums"],
    queryFn: () => getCurriculumsByStudy(id),
    enabled: !Number.isNaN(id) && !!study,
  });

  const updateMutation = useMutation({
    mutationFn: (body: Parameters<typeof updateStudy>[1]) => updateStudy(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies", id] });
      setEditOpen(false);
      showToast("스터디가 수정되었습니다.", "success");
    },
    onError: () => showToast("스터디 수정에 실패했습니다.", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteStudy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies"] });
      showToast("스터디가 삭제되었습니다.", "success");
      router.replace("/studies");
    },
    onError: () => showToast("스터디 삭제에 실패했습니다.", "error"),
  });

  if (Number.isNaN(id) || isError || (!isPending && !study)) {
    return (
      <div>
        <p className="text-gray-500">스터디를 찾을 수 없습니다.</p>
        <Link href="/studies" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">목록으로</Link>
      </div>
    );
  }

  if (isPending || !study) return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" role="status" aria-label="로딩 중" />
    </div>
  );

  return (
    <div>
      <Link href="/studies" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
        ← 스터디 목록
      </Link>

      {/* Hero */}
      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{study.name}</h1>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${levelBadgeCls[study.level] ?? "bg-gray-100 text-gray-600"}`}>
                {LEVEL_LABEL[study.level] ?? study.level}
              </span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeBadgeCls[study.type] ?? "bg-gray-100 text-gray-600"}`}>
                {TYPE_LABEL[study.type] ?? study.type}
              </span>
            </div>
            <p className="mt-3 text-gray-700">{study.description}</p>
          </div>
          {isAdmin && (
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                수정
              </button>
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
              >
                삭제
              </button>
            </div>
          )}
        </div>
      </div>

      {isAdmin && editOpen && (
        <div className="mt-4">
          <StudyForm
            defaultValues={{
              name: study.name,
              description: study.description,
              level: study.level as StudyLevel,
              type: study.type as StudyType,
            }}
            onSubmit={(v) => updateMutation.mutate(v)}
            onCancel={() => setEditOpen(false)}
            isPending={updateMutation.isPending}
          />
        </div>
      )}

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">커리큘럼</h2>
          <Link
            href={`/studies/${id}/curriculums`}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            전체 보기 →
          </Link>
        </div>
        {curriculums.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {curriculums.map((c, idx) => (
              <li key={c.id}>
                <Link
                  href={`/studies/${id}/curriculums/${c.id}`}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-900">{c.title}</span>
                    <span className="ml-2 text-sm text-gray-500">게시글 {c.postsCount}개</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 text-center">
            <p className="text-gray-500">등록된 커리큘럼이 없습니다.</p>
          </div>
        )}
      </section>

      {deleteOpen && (
        <ConfirmModal
          message="이 스터디를 삭제하시겠습니까? 하위 커리큘럼도 영향을 받을 수 있습니다."
          onConfirm={() => deleteMutation.mutate()}
          onCancel={() => setDeleteOpen(false)}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
