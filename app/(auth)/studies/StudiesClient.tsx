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
import { Button } from "@/components/ui/Button";

const levelBadgeCls: Record<string, string> = {
  BASIC: "ui-badge ui-badge-basic",
  INTERMEDIATE: "ui-badge ui-badge-intermediate",
  ADVANCED: "ui-badge ui-badge-advanced",
};

const typeBadgeCls: Record<string, string> = {
  BACKEND: "ui-badge ui-badge-backend",
  COMPUTER_SCIENCE: "ui-badge ui-badge-cs",
  ALGORITHM: "ui-badge ui-badge-algorithm",
};

export default function StudiesClient() {
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
    // onError 부분 제거: QueryProvider 내 MutationCache에서 전역 처리됨
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: StudyRequest }) => updateStudy(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies", studyType] });
      setEditingId(null);
      showToast("스터디가 수정되었습니다.", "success");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStudy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies", studyType] });
      setDeletingId(null);
      showToast("스터디가 삭제되었습니다.", "success");
    },
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
          <h1 className="ui-title">스터디 목록</h1>
          <p className="ui-subtitle">분야별 스터디를 탐색하고 학습을 시작해보세요.</p>
        </div>
        {isAdmin && (
          <Button type="button" variant="primary" onClick={() => setCreateOpen(true)}>
            스터디 추가
          </Button>
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
      <div className="mt-6 flex gap-1 rounded-xl bg-[var(--surface-container-low)] p-1 border-ghost shadow-sm">
        {STUDY_TYPE_VALUES.map((t) => (
          <Link
            key={t}
            href={`/studies?studyType=${t}`}
            className={`flex-1 rounded-lg px-4 py-2 text-center text-sm font-semibold transition-all ${
              studyType === t
                ? "bg-[var(--ui-seg-active-bg)] text-[var(--primary)] shadow-[0_10px_22px_-18px_rgba(0,0,0,0.55),0_2px_6px_-3px_rgba(0,0,0,0.18)]"
                : "text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] hover:bg-[var(--surface-container-high)]"
            }`}
          >
            {TYPE_LABEL[t]}
          </Link>
        ))}
      </div>

      {data.content.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-[var(--ui-text-muted)]">등록된 스터디가 없습니다.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {allStudies.map((s) => (
            <li key={s.id} className="ui-card">
              <div className="flex items-start justify-between p-5">
                <Link href={`/studies/${s.id}`} className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-[var(--ui-text)]">{s.name}</h2>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${levelBadgeCls[s.level] ?? "bg-gray-100 text-gray-600"}`}>
                      {LEVEL_LABEL[s.level] ?? s.level}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeBadgeCls[s.type] ?? "bg-gray-100 text-gray-600"}`}>
                      {TYPE_LABEL[s.type] ?? s.type}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--ui-text-muted)] line-clamp-2">{s.description}</p>
                </Link>
                {isAdmin && (
                  <div className="ml-4 flex shrink-0 gap-2">
                    <Button
                      type="button"
                      onClick={() => setEditingId(s.id)}
                      variant="outline"
                      className="px-3 py-1.5 text-sm"
                    >
                      수정
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setDeletingId(s.id)}
                      variant="danger"
                      className="px-3 py-1.5 text-sm"
                    >
                      삭제
                    </Button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm text-[var(--ui-text-subtle)]">전체 {data.page.totalElements}개</span>
        <div className="flex gap-2">
          {data.page.number > 0 && (
            <Link
              href={`/studies?studyType=${studyType}&page=${page - 1}`}
              className="ui-btn ui-btn-surface px-3 py-1.5 text-sm"
            >
              ← 이전
            </Link>
          )}
          {data.page.number + 1 < data.page.totalPages && (
            <Link
              href={`/studies?studyType=${studyType}&page=${page + 1}`}
              className="ui-btn ui-btn-surface px-3 py-1.5 text-sm"
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
