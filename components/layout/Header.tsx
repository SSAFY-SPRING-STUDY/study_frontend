"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore, useIsAdmin } from "@/store/auth-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { logout } from "@/lib/api/auth";
import { createNotificationEventSource, getNotifications, markNotificationRead } from "@/lib/api/notifications";
import type { NotificationResponse } from "@/lib/types/notification";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        active
          ? "text-indigo-600"
          : "text-gray-600 hover:text-gray-900"
      }`}
    >
      {children}
    </Link>
  );
}

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
        className="relative text-gray-600 hover:text-gray-900 transition-colors"
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
        <div className="absolute right-0 top-8 z-50 w-80 rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <span className="text-sm font-semibold text-gray-900">알림</span>
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              상세보기 →
            </Link>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isFetching ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">알림이 없습니다.</p>
            ) : (
              <ul>
                {notifications.map((n: NotificationResponse) => (
                  <li
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 ${
                      n.isRead ? "" : "bg-indigo-50"
                    }`}
                  >
                    {!n.isRead && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                    )}
                    {n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${n.isRead ? "text-gray-600" : "font-medium text-gray-900"}`}>
                        {n.content}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {new Date(n.createdAt).toLocaleString("ko-KR")}
                      </p>
                    </div>
                    {!n.isRead && (
                      <button
                        type="button"
                        onClick={() => readMutation.mutate(n.id)}
                        disabled={readMutation.isPending}
                        className="shrink-0 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
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

export function Header() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = useIsAdmin();
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const es = createNotificationEventSource();

    es.addEventListener("notification", (e: MessageEvent) => {
      try {
        const notification = JSON.parse(e.data) as NotificationResponse;
        if (!notification.isRead) {
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

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
      window.location.href = "/login";
    },
  });

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="로고" width={120} height={36} className="h-9 w-auto" priority />
        </Link>
        <nav className="flex items-center gap-5">
          <NavLink href="/studies">스터디</NavLink>
          <NavLink href="/notices">공지사항</NavLink>
          {user ? (
            <>
              <NavLink href="/members/me">내 정보</NavLink>
              <NotificationDropdown
                unreadCount={unreadCount}
                onOpen={() => setUnreadCount(0)}
              />
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
                >
                  관리자
                </Link>
              )}
              <button
                type="button"
                onClick={() => logoutMutation.mutate()}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
                disabled={logoutMutation.isPending}
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
