"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createNotificationEventSource, getNotifications, markNotificationRead } from "@/lib/api/notifications";
import type { NotificationResponse } from "@/lib/types/notification";
import { formatRelativeTime } from "@/lib/utils/time";
import { GitHubIcon, ORG_GITHUB_URL } from "./Footer";

function NotificationDropdown({
  unreadCount,
  onOpen,
}: {
  unreadCount: number;
  onOpen: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data, isFetching } = useQuery({
    queryKey: ["notifications-dropdown"],
    queryFn: () => getNotifications({ page: 0, size: 5 }),
    enabled: open,
    staleTime: 0,
  });

  const readMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-dropdown"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleToggle() {
    setOpen((v) => !v);
    if (!open) onOpen();
  }

  const notifications = data?.content ?? [];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative text-[var(--on-surface)]/60 hover:text-[var(--on-surface)] transition-colors"
        aria-label="알림"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 w-80 rounded-xl glass shadow-ambient">
          <div className="flex items-center justify-between bg-[var(--surface-container-low)] rounded-t-xl px-4 py-3">
            <span className="text-sm font-semibold text-[var(--on-surface)]">알림</span>
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-[var(--primary)] hover:opacity-70 transition-opacity"
            >
              상세보기 →
            </Link>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isFetching ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--surface-container-high)] border-t-[var(--primary)]" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--on-surface)]/50">알림이 없습니다.</p>
            ) : (
              <ul>
                {notifications.map((n: NotificationResponse) => (
                  // NOTE: 백엔드의 isRead 의미가 반대로 오는 케이스 대응
                  // (사용자 관측: 읽지 않은 글이 '읽음'처럼 표시됨)
                  // 현재 UI에서는 isRead=true를 '미읽음'으로 취급한다.
                  <li
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 ${
                      n.isRead ? "bg-[var(--surface-container-low)]" : ""
                    }`}
                  >
                    {n.isRead && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--primary)]" />
                    )}
                    {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${n.isRead ? "font-medium text-[var(--on-surface)]" : "text-[var(--on-surface)]/60"}`}>
                        {n.content}
                      </p>
                      <p className="mt-0.5 text-label text-[var(--on-surface)]/40">
                        {formatRelativeTime(n.createdAt)}
                      </p>
                    </div>
                    {n.isRead && (
                      <button
                        type="button"
                        onClick={() => readMutation.mutate(n.id)}
                        disabled={readMutation.isPending}
                        className="shrink-0 rounded-md bg-[var(--surface-container-high)] px-2 py-1 text-xs text-[var(--on-surface)]/60 hover:text-[var(--on-surface)] disabled:opacity-50 transition-colors"
                      >
                        읽음
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

export function Header({ onToggleSidebarAction }: { onToggleSidebarAction?: () => void }) {
  const user = useAuthStore((s) => s.user);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const es = createNotificationEventSource();

    es.addEventListener("notification", (e: MessageEvent) => {
      try {
        const notification = JSON.parse(e.data) as NotificationResponse;
        if (notification.isRead) {
          setUnreadCount((n) => n + 1);
        }
      } catch {
        // ignore parse errors
      }
    });

    return () => {
      es.close();
    };
  }, [user]);

  return (
    <header className="sticky top-0 z-30 bg-[var(--surface)] border-b border-[var(--ui-card-border-strong)]/40">
      <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
        {user ? (
          <button
            type="button"
            onClick={onToggleSidebarAction}
            className="lg:hidden inline-flex items-center justify-center rounded-lg px-2 py-2 text-[var(--on-surface)]/70 hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)] transition-colors"
            aria-label="사이드바 열기"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        ) : (
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:opacity-80 transition-opacity"
            aria-label="홈으로 이동"
          >
            <Image src="/logo.png" alt="" width={28} height={28} className="h-7 w-auto" priority />
            <span className="text-sm font-bold text-[var(--on-surface)]">스터디 플랫폼</span>
          </Link>
        )}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <a
            href={ORG_GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="SSAFY Spring Study GitHub 조직"
            title="GitHub 조직"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--on-surface)]/65 hover:text-[var(--on-surface)] hover:bg-[var(--surface-container-low)] transition-colors"
          >
            <GitHubIcon className="h-5 w-5" />
          </a>
          {user ? (
            <div className="lg:hidden">
              <NotificationDropdown
                unreadCount={unreadCount}
                onOpen={() => setUnreadCount(0)}
              />
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-[var(--primary)] hover:bg-[var(--surface-container-low)] px-3 py-1.5 rounded-lg transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center rounded-[1.5rem] bg-gradient-primary px-5 py-1.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
