"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markNotificationRead } from "@/lib/api/notifications";
import { Pagination } from "@/components/ui/Pagination";
import { useToast } from "@/lib/toast";

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [page, setPage] = useState(0);

  const { data, isPending } = useQuery({
    queryKey: ["notifications", page],
    queryFn: () => getNotifications({ page, size: PAGE_SIZE }),
  });

  const readMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => showToast("읽음 처리에 실패했습니다.", "error"),
  });

  const notifications = data?.content ?? [];

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">알림</h1>
        <p className="mt-1 text-sm text-gray-600">최근 활동 알림을 확인하세요.</p>
      </div>

      {isPending ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <div
            className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"
            role="status"
            aria-label="로딩 중"
          />
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">알림이 없습니다.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`flex items-start justify-between rounded-xl border p-4 shadow-sm ${
                n.isRead
                  ? "border-gray-200 bg-white"
                  : "border-indigo-200 bg-indigo-50"
              }`}
            >
              <div className="flex items-start gap-3">
                {!n.isRead && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                )}
                <div>
                  <p className={`text-sm ${n.isRead ? "text-gray-700" : "font-medium text-gray-900"}`}>
                    {n.content}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleString("ko-KR")}
                  </p>
                </div>
              </div>
              {!n.isRead && (
                <button
                  type="button"
                  onClick={() => readMutation.mutate(n.id)}
                  disabled={readMutation.isPending}
                  className="ml-4 shrink-0 inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  읽음
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <Pagination
        page={page}
        totalPages={data?.page.totalPages ?? 0}
        onPageChange={setPage}
      />
    </div>
  );
}
