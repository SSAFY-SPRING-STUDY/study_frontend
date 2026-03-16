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
        <p className="text-gray-500">스터디를 찾을 수 없습니다.</p>
        <Link href="/studies" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">스터디 목록</Link>
      </div>
    );
  }

  if (studyPending || !study) return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" role="status" aria-label="로딩 중" />
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
      <nav className="flex items-center gap-1 text-sm text-gray-500">
        <Link href="/studies" className="hover:text-gray-900 transition-colors">스터디 목록</Link>
        <span>/</span>
        <Link href={`/studies/${id}`} className="hover:text-gray-900 transition-colors">{study.name}</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">커리큘럼</span>
      </nav>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{study.name}</h1>
          <p className="mt-1 text-sm text-gray-600">커리큘럼 목록</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            커리큘럼 추가
          </button>
        )}
      </div>

      {isAdmin && createOpen && (
        <div className="mt-4">
          <CurriculumForm
            onSubmit={(v) => createMutation.mutate(v)}
            onCancel={() => setCreateOpen(false)}
            isPending={createMutation.isPending}
          />
        </div>
      )}

      {isAdmin && editingId != null && editingDefaults && (
        <div className="mt-4">
          <CurriculumForm
            key={editingId}
            defaultValues={editingDefaults}
            onSubmit={(v) => updateMutation.mutate({ cid: editingId, body: v })}
            onCancel={() => setEditingId(null)}
            isPending={updateMutation.isPending}
          />
        </div>
      )}

      {listPending ? (
        <div className="mt-6 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" role="status" aria-label="로딩 중" />
        </div>
      ) : curriculums.length === 0 ? (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">등록된 커리큘럼이 없습니다.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {curriculums.map((c, idx) => (
            <li key={c.id} className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between p-4">
                <Link href={`/studies/${id}/curriculums/${c.id}`} className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="font-medium text-gray-900">{c.title}</span>
                    <span className="ml-2 text-sm text-gray-500">게시글 {c.postsCount}개</span>
                    {c.description && (
                      <p className="mt-1 text-sm text-gray-600 line-clamp-1">{c.description}</p>
                    )}
                  </div>
                </Link>
                {isAdmin && (
                  <div className="ml-4 flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(c.id)}
                      className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingId(c.id)}
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

      <p className="mt-6">
        <Link href={`/studies/${id}`} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          ← 스터디로 돌아가기
        </Link>
      </p>

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
