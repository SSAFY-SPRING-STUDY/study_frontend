"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotices, createNotice, updateNotice, deleteNotice } from "@/lib/api/notices";
import type { NoticeRequest } from "@/lib/types/notice";
import { useIsAdmin } from "@/store/auth-store";
import { NoticeForm } from "@/components/forms/NoticeForm";
import type { NoticeFormValues } from "@/components/forms/NoticeForm";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/lib/toast";
import { Button } from "@/components/ui/Button";

export function NoticesClient() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || 0);
  const size = 10;
  const isAdmin = useIsAdmin();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isPending, isError } = useQuery({
    queryKey: ["notices", page, size],
    queryFn: () => getNotices({ page, size }),
  });

  const list = data?.content ?? [];

  const createMutation = useMutation({
    mutationFn: createNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      setCreateOpen(false);
      showToast("공지가 작성되었습니다.", "success");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: NoticeRequest }) => updateNotice(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      setEditingId(null);
      showToast("공지가 수정되었습니다.", "success");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      setDeletingId(null);
      showToast("공지가 삭제되었습니다.", "success");
    },
  });

  const editingNotice = list.find((n) => n.id === editingId);
  const editingDefaults: NoticeFormValues | undefined = editingNotice
    ? { title: editingNotice.title, content: editingNotice.content }
    : undefined;

  if (isPending) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--surface-container-high)] border-t-[var(--primary)]"
          role="status"
          aria-label="로딩 중"
        />
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-red-600">공지사항 목록을 불러오지 못했습니다.</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="ui-title">공지사항</h1>
          <p className="ui-subtitle">중요한 안내와 소식을 확인하세요.</p>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            공지 작성
          </Button>
        )}
      </div>

      {isAdmin && createOpen && (
        <div className="mb-6">
          <NoticeForm
            onSubmit={(v) => createMutation.mutate(v)}
            onCancel={() => setCreateOpen(false)}
            isPending={createMutation.isPending}
          />
        </div>
      )}

      {isAdmin && editingId != null && editingDefaults && (
        <div className="mb-6">
          <NoticeForm
            key={editingId}
            defaultValues={editingDefaults}
            onSubmit={(v) => updateMutation.mutate({ id: editingId, body: v })}
            onCancel={() => setEditingId(null)}
            isPending={updateMutation.isPending}
          />
        </div>
      )}

      {list.length === 0 ? (
        <div className="rounded-xl bg-[var(--surface-container-lowest)] p-10 text-center">
          <p className="text-[var(--ui-text-muted)]">등록된 공지가 없습니다.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((n) => (
            <li
              key={n.id}
              className="ui-card p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <Link href={`/notices/${n.id}`} className="min-w-0 flex-1">
                  <h2 className="font-semibold leading-relaxed text-[var(--ui-text)]">{n.title}</h2>
                  <span className="mt-1 block shrink-0 text-label text-[var(--ui-text-subtle)]">
                    {new Date(n.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--ui-text-muted)]">
                    {n.content}
                  </p>
                </Link>
                {isAdmin && (
                  <div className="ml-4 flex shrink-0 gap-2">
                    <Button type="button" variant="outline" onClick={() => setEditingId(n.id)} className="px-3 py-1.5 text-sm">
                      수정
                    </Button>
                    <Button type="button" variant="danger" onClick={() => setDeletingId(n.id)} className="px-3 py-1.5 text-sm">
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
        <span className="text-label text-[var(--on-surface)]/50">전체 {data.page.totalElements}개</span>
        <div className="flex gap-2">
          {data.page.number > 0 && (
            <Link href={`/notices?page=${page - 1}`} className="ui-btn ui-btn-surface px-3 py-1.5 text-sm">
              ← 이전
            </Link>
          )}
          {data.page.number + 1 < data.page.totalPages && (
            <Link href={`/notices?page=${page + 1}`} className="ui-btn ui-btn-surface px-3 py-1.5 text-sm">
              다음 →
            </Link>
          )}
        </div>
      </div>

      {isAdmin && deletingId != null && (
        <ConfirmModal
          message="이 공지를 삭제하시겠습니까?"
          onConfirm={() => deleteMutation.mutate(deletingId)}
          onCancel={() => setDeletingId(null)}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  );
}

