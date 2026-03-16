"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStudies, createStudy, updateStudy, deleteStudy } from "@/lib/api/studies";
import type { StudyRequest, StudyLevel, StudyType } from "@/lib/types/study";
import { LEVEL_LABEL, TYPE_LABEL, STUDY_TYPES as STUDY_TYPE_VALUES } from "@/lib/constants";
import { useIsAdmin } from "@/store/auth-store";
import { StudyForm } from "@/components/forms/StudyForm";
import type { StudyFormValues } from "@/components/forms/StudyForm";
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

export default function StudyListPage() {
  const searchParams = useSearchParams();
  const studyType = (searchParams.get("studyType") as StudyType) || "BACKEND";
  const page = Number(searchParams.get("page") || 0);
  const size = 10;
  const isAdmin = useIsAdmin();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isPending, isError } = useQuery({
    queryKey: ["studies", studyType, page, size],
    queryFn: () => getStudies({ studyType, page, size }),
  });

  const allStudies = data?.content ?? [];

  const createMutation = useMutation({
    mutationFn: createStudy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies", studyType] });
      setCreateOpen(false);
      showToast("스터디가 생성되었습니다.", "success");
    },
    onError: () => showToast("스터디 생성에 실패했습니다.", "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: StudyRequest }) => updateStudy(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies", studyType] });
      setEditingId(null);
      showToast("스터디가 수정되었습니다.", "success");
    },
    onError: () => showToast("스터디 수정에 실패했습니다.", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStudy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies", studyType] });
      setDeletingId(null);
      showToast("스터디가 삭제되었습니다.", "success");
    },
    onError: () => showToast("스터디 삭제에 실패했습니다.", "error"),
  });

  const editingStudy = allStudies.find((s) => s.id === editingId);
  const editingDefaults: StudyFormValues | undefined = editingStudy
    ? {
        name: editingStudy.name,
        description: editingStudy.description,
        level: editingStudy.level as StudyLevel,
        type: editingStudy.type as StudyType,
      }
    : undefined;

  if (isPending) return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" role="status" aria-label="로딩 중" />
    </div>
  );
  if (isError || !data) return <p className="text-red-600">스터디 목록을 불러오지 못했습니다.</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">스터디 목록</h1>
          <p className="mt-1 text-sm text-gray-600">분야별 스터디를 탐색하고 학습을 시작해보세요.</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            스터디 추가
          </button>
        )}
      </div>

      {isAdmin && createOpen && (
        <div className="mt-4">
          <StudyForm
            onSubmit={(v) => createMutation.mutate(v)}
            onCancel={() => setCreateOpen(false)}
            isPending={createMutation.isPending}
          />
        </div>
      )}

      {isAdmin && editingId != null && editingDefaults && (
        <div className="mt-4">
          <StudyForm
            key={editingId}
            defaultValues={editingDefaults}
            onSubmit={(v) => updateMutation.mutate({ id: editingId, body: v })}
            onCancel={() => setEditingId(null)}
            isPending={updateMutation.isPending}
          />
        </div>
      )}

      {/* Type filter tabs */}
      <div className="mt-6 flex gap-1 rounded-xl bg-gray-100 p-1">
        {STUDY_TYPE_VALUES.map((t) => (
          <Link
            key={t}
            href={`/studies?studyType=${t}`}
            className={`flex-1 rounded-lg px-4 py-2 text-center text-sm font-medium transition-colors ${
              studyType === t
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {TYPE_LABEL[t]}
          </Link>
        ))}
      </div>

      {data.empty ? (
        <div className="mt-12 text-center">
          <p className="text-gray-500">등록된 스터디가 없습니다.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {allStudies.map((s) => (
            <li key={s.id} className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between p-5">
                <Link href={`/studies/${s.id}`} className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-gray-900">{s.name}</h2>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${levelBadgeCls[s.level] ?? "bg-gray-100 text-gray-600"}`}>
                      {LEVEL_LABEL[s.level] ?? s.level}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeBadgeCls[s.type] ?? "bg-gray-100 text-gray-600"}`}>
                      {TYPE_LABEL[s.type] ?? s.type}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{s.description}</p>
                </Link>
                {isAdmin && (
                  <div className="ml-4 flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(s.id)}
                      className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingId(s.id)}
                      className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm text-gray-500">전체 {data.totalElements}개</span>
        <div className="flex gap-2">
          {!data.first && (
            <Link
              href={`/studies?studyType=${studyType}&page=${page - 1}`}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ← 이전
            </Link>
          )}
          {!data.last && (
            <Link
              href={`/studies?studyType=${studyType}&page=${page + 1}`}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              다음 →
            </Link>
          )}
        </div>
      </div>

      {deletingId != null && (
        <ConfirmModal
          message="이 스터디를 삭제하시겠습니까? 하위 커리큘럼도 영향을 받을 수 있습니다."
          onConfirm={() => deleteMutation.mutate(deletingId)}
          onCancel={() => setDeletingId(null)}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
