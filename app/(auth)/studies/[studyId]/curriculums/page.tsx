"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStudy } from "@/lib/api/studies";
import {
  getCurriculumsByStudy,
  createCurriculum,
  updateCurriculum,
  deleteCurriculum,
} from "@/lib/api/curriculums";
import type { CurriculumRequest } from "@/lib/types/curriculum";
import { useIsAdmin } from "@/store/auth-store";
import { CurriculumForm } from "@/components/forms/CurriculumForm";
import type { CurriculumFormValues } from "@/components/forms/CurriculumForm";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/lib/toast";
import { Button } from "@/components/ui/Button";

export default function StudyCurriculumsPage({
  params,
}: {
  params: Promise<{ studyId: string }>;
}) {
  const { studyId } = use(params);
  const id = Number(studyId);
  const isAdmin = useIsAdmin();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: study, isPending: studyPending, isError: studyError } = useQuery({
    queryKey: ["studies", id],
    queryFn: () => getStudy(id),
    enabled: !Number.isNaN(id),
  });

  const { data: curriculums = [], isPending: listPending } = useQuery({
    queryKey: ["studies", id, "curriculums"],
    queryFn: () => getCurriculumsByStudy(id),
    enabled: !Number.isNaN(id),
  });

  const createMutation = useMutation({
    mutationFn: (body: CurriculumRequest) => createCurriculum(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies", id, "curriculums"] });
      setCreateOpen(false);
      showToast("커리큘럼이 생성되었습니다.", "success");
    },
    onError: () => showToast("커리큘럼 생성에 실패했습니다.", "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ cid, body }: { cid: number; body: CurriculumRequest }) =>
      updateCurriculum(cid, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies", id, "curriculums"] });
      setEditingId(null);
      showToast("커리큘럼이 수정되었습니다.", "success");
    },
    onError: () => showToast("커리큘럼 수정에 실패했습니다.", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCurriculum,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies", id, "curriculums"] });
      setDeletingId(null);
      showToast("커리큘럼이 삭제되었습니다.", "success");
    },
    onError: () => showToast("커리큘럼 삭제에 실패했습니다.", "error"),
  });

  if (Number.isNaN(id) || studyError || (!studyPending && !study)) {
    return (
      <div>
        <p className="text-[var(--on-surface)]/50">스터디를 찾을 수 없습니다.</p>
        <Link href="/studies" className="mt-4 inline-block text-sm text-[var(--primary)] hover:underline">스터디 목록</Link>
      </div>
    );
  }

  if (studyPending || !study) return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--surface-container-high)] border-t-[var(--primary)]" role="status" aria-label="로딩 중" />
    </div>
  );

  const editingCurriculum = curriculums.find((c) => c.id === editingId);
  const editingDefaults: CurriculumFormValues | undefined = editingCurriculum
    ? {
        name: editingCurriculum.title,
        description: editingCurriculum.description,
        order: editingCurriculum.order,
      }
    : undefined;

  return (
    <div>
      <nav className="flex items-center gap-1 text-sm text-[var(--on-surface)]/50">
        <Link href="/studies" className="hover:text-[var(--on-surface)] transition-colors">스터디 목록</Link>
        <span>/</span>
        <Link href={`/studies/${id}`} className="hover:text-[var(--on-surface)] transition-colors">{study.name}</Link>
        <span>/</span>
        <span className="text-[var(--on-surface)] font-medium">커리큘럼</span>
      </nav>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="ui-title">{study.name}</h1>
          <p className="ui-subtitle">커리큘럼 목록</p>
        </div>
        {isAdmin && (
          <Button type="button" variant="primary" onClick={() => setCreateOpen(true)}>
            커리큘럼 추가
          </Button>
        )}
      </div>


      {listPending ? (
        <div className="mt-6 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--surface-container-high)] border-t-[var(--primary)]" role="status" aria-label="로딩 중" />
        </div>
      ) : curriculums.length === 0 ? (
        <div className="mt-6 rounded-xl bg-[var(--surface-container-lowest)] p-10 text-center">
          <p className="text-[var(--ui-text-muted)]">등록된 커리큘럼이 없습니다.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {curriculums.map((c, idx) => (
            <li key={c.id} className="ui-card">
              <div className="flex items-start justify-between p-4">
                <Link href={`/studies/${id}/curriculums/${c.id}`} className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-sm font-bold text-[var(--primary)]">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="font-medium text-[var(--ui-text)]">{c.title}</span>
                    <span className="ml-2 text-sm text-[var(--ui-text-subtle)]">게시글 {c.postsCount}개</span>
                    {c.description && (
                      <p className="mt-1 text-sm text-[var(--ui-text-muted)] line-clamp-1">{c.description}</p>
                    )}
                  </div>
                </Link>
                {isAdmin && (
                  <div className="ml-4 flex shrink-0 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditingId(c.id)}
                      className="px-3 py-1.5 text-sm"
                    >
                      수정
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => setDeletingId(c.id)}
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

      <p className="mt-6">
        <Link href={`/studies/${id}`} className="text-sm text-[var(--on-surface)]/50 hover:text-[var(--on-surface)] transition-colors">
          ← 스터디로 돌아가기
        </Link>
      </p>

      {isAdmin && createOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setCreateOpen(false)}
        >
          <div
            className="z-50 w-full max-w-lg rounded-2xl bg-[var(--surface-container-lowest)] p-6 shadow-ambient [outline:1px_solid_var(--ui-card-border-strong)] [outline-offset:-1px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-[var(--on-surface)]">커리큘럼 추가</h3>
            <CurriculumForm
              onSubmit={(v) => createMutation.mutate(v)}
              onCancel={() => setCreateOpen(false)}
              isPending={createMutation.isPending}
            />
          </div>
        </div>
      )}

      {isAdmin && editingId != null && editingDefaults && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setEditingId(null)}
        >
          <div
            className="z-50 w-full max-w-lg rounded-2xl bg-[var(--surface-container-lowest)] p-6 shadow-ambient [outline:1px_solid_var(--ui-card-border-strong)] [outline-offset:-1px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-[var(--on-surface)]">커리큘럼 수정</h3>
            <CurriculumForm
              key={editingId}
              defaultValues={editingDefaults}
              onSubmit={(v) => updateMutation.mutate({ cid: editingId, body: v })}
              onCancel={() => setEditingId(null)}
              isPending={updateMutation.isPending}
            />
          </div>
        </div>
      )}

      {deletingId != null && (
        <ConfirmModal
          message="이 커리큘럼을 삭제하시겠습니까?"
          onConfirm={() => deleteMutation.mutate(deletingId)}
          onCancel={() => setDeletingId(null)}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
