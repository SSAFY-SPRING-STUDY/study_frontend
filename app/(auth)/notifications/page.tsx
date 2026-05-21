"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markNotificationRead } from "@/lib/api/notifications";
import { formatRelativeTime } from "@/lib/utils/time";
import { Pagination } from "@/components/ui/Pagination";
import { useToast } from "@/lib/toast";
import { Button } from "@/components/ui/Button";

const PAGE_SIZE = 20;
type Filter = "all" | "unread";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");

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
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const visible = filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="ui-title">알림</h1>
        <p className="ui-subtitle">최근 활동 알림을 확인하세요.</p>
      </div>

      <div className="ui-card-static mb-4 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--ui-text)]">
              {unreadCount > 0 ? `미읽음 ${unreadCount}개` : "모든 알림을 확인했어요"}
            </p>
            <p className="mt-0.5 text-label text-[var(--ui-text-muted)]">
              목록을 클릭하면 자동으로 읽음 처리됩니다.
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl bg-[var(--surface-container-low)] p-1">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  filter === "all"
                    ? "bg-[var(--ui-seg-active-bg)] text-[var(--primary)] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                    : "text-[var(--ui-text-subtle)] hover:text-[var(--ui-text)]"
                }`}
              >
                전체
              </button>
              <button
                type="button"
                onClick={() => setFilter("unread")}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  filter === "unread"
                    ? "bg-[var(--ui-seg-active-bg)] text-[var(--primary)] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                    : "text-[var(--ui-text-subtle)] hover:text-[var(--ui-text)]"
                }`}
              >
                미읽음
              </button>
            </div>

            <Button
              type="button"
              variant="surface"
              className="px-3 py-2 text-sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["notifications"] })}
              disabled={isPending}
            >
              새로고침
            </Button>
          </div>
        </div>
      </div>

      {isPending ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <div
            className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--surface-container-high)] border-t-[var(--primary)]"
            role="status"
            aria-label="로딩 중"
          />
        </div>
      ) : visible.length === 0 ? (
        <div className="ui-card-static p-10 text-center">
          <p className="text-[var(--ui-text-muted)]">
            {filter === "unread" ? "미읽음 알림이 없습니다." : "알림이 없습니다."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((n) => (
            <li
              key={n.id}
              onClick={() => {
                if (!n.isRead) readMutation.mutate(n.id);
              }}
              className={`ui-card group flex cursor-pointer items-start gap-3 p-5 ${n.isRead ? "opacity-80" : ""}`}
            >
              {!n.isRead && (
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--primary)]" />
              )}
              <div>
                <p
                  className={`text-sm ${
                    n.isRead
                      ? "text-[var(--ui-text-muted)]"
                      : "font-medium text-[var(--ui-text)]"
                  }`}
                >
                  {n.content}
                </p>
                <p className="mt-1 text-label text-[var(--ui-text-subtle)]">
                  {formatRelativeTime(n.createdAt)}
                </p>
              </div>
              {!n.isRead && (
                <span className="ml-auto mt-0.5 text-xs font-medium text-[var(--ui-text-subtle)] opacity-0 transition-opacity group-hover:opacity-100">
                  클릭해서 읽음
                </span>
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
