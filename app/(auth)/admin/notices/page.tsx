"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotices, createNotice, updateNotice, deleteNotice } from "@/lib/api/notices";
import type { NoticeRequest } from "@/lib/types/notice";
import { NoticeForm } from "@/components/forms/NoticeForm";
import type { NoticeFormValues } from "@/components/forms/NoticeForm";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Pagination } from "@/components/ui/Pagination";
import { useToast } from "@/lib/toast";

const PAGE_SIZE = 20;

export default function AdminNoticesPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isPending } = useQuery({
    queryKey: ["admin", "notices", page, PAGE_SIZE],
    queryFn: () => getNotices({ page, size: PAGE_SIZE }),
  });

  const list = data?.content ?? [];

  const createMutation = useMutation({
    mutationFn: createNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notices"] });
      setCreateOpen(false);
      setPage(0);
      showToast("공지가 작성되었습니다.", "success");
    },
    onError: () => {
      showToast("공지 작성에 실패했습니다.", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: NoticeRequest }) => updateNotice(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notices"] });
      setEditingId(null);
      showToast("공지가 수정되었습니다.", "success");
    },
    onError: () => {
      showToast("공지 수정에 실패했습니다.", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notices"] });
      setDeletingId(null);
      showToast("공지가 삭제되었습니다.", "success");
    },
    onError: () => {
      showToast("공지 삭제에 실패했습니다.", "error");
    },
  });

  const editingNotice = list.find((n) => n.id === editingId);
  const editingDefaults: NoticeFormValues | undefined = editingNotice
    ? { title: editingNotice.title, content: editingNotice.content }
    : undefined;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">공지사항 관리</h1>
          <p className="mt-1 text-sm text-gray-600">공지사항을 작성하고 관리하세요.</p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          공지 작성
        </button>
      </div>

      {createOpen && (
        <NoticeForm
          onSubmit={(v) => createMutation.mutate(v)}
          onCancel={() => setCreateOpen(false)}
          isPending={createMutation.isPending}
        />
      )}

      {editingId != null && editingDefaults && (
        <NoticeForm
          key={editingId}
          defaultValues={editingDefaults}
          onSubmit={(v) => updateMutation.mutate({ id: editingId, body: v })}
          onCancel={() => setEditingId(null)}
          isPending={updateMutation.isPending}
        />
      )}

      {isPending ? (
        <div className="mt-6 flex justify-center">
          <div
            className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600"
            role="status"
            aria-label="로딩 중"
          />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {list.map((n) => (
            <li
              key={n.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div>
                <span className="font-medium text-gray-900">{n.title}</span>
                <span className="ml-2 text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString("ko-KR")}</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label={`${n.title} 수정`}
                  onClick={() => setEditingId(n.id)}
                  className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  수정
                </button>
                <button
                  type="button"
                  aria-label={`${n.title} 삭제`}
                  onClick={() => setDeletingId(n.id)}
                  className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Pagination
        page={page}
        totalPages={data?.page.totalPages ?? 0}
        onPageChange={setPage}
      />

      {deletingId != null && (
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
