"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useAuthStore, useIsAdmin } from "@/store/auth-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "@/lib/api/auth";
import { useTheme } from "@/components/providers/ThemeProvider";
import { GitHubIcon, ORG_GITHUB_URL } from "./Footer";

function SidebarLink({
  href,
  icon,
  children,
  exact = false,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  exact?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] hover:scale-[1.01] ${
        isActive
          ? "bg-[var(--sidebar-accent-soft)] text-[var(--on-sidebar-active)] ring-1 ring-[var(--sidebar-accent-soft)]"
          : "text-[var(--on-sidebar)] hover:text-[var(--on-sidebar-active)] hover:bg-[var(--sidebar-accent-soft)]"
      }`}
    >
      <span className="transition-transform duration-150 ease-out group-hover:scale-[1.06] group-hover:-rotate-1">
        {icon}
      </span>
      <span className="transition-transform duration-150 ease-out group-hover:translate-x-0.5">
        {children}
      </span>
    </Link>
  );
}

// Simple inline SVG icons
const IconStudy = () => (
  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const IconNotice = () => (
  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
  </svg>
);

const IconUser = () => (
  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconBell = () => (
  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const IconShield = () => (
  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const IconLogout = () => (
  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const IconSun = () => (
  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
  </svg>
);

const IconMoon = () => (
  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  usePathname();
  const user = useAuthStore((s) => s.user);
  const isAdmin = useIsAdmin();
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();
  const { theme, toggleTheme } = useTheme();

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
      window.location.href = "/login";
    },
  });

  // Hide when not authenticated
  if (!user) return null;

  const body = (
    <>
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        <SidebarLink href="/studies" icon={<IconStudy />} onClick={onClose}>스터디</SidebarLink>
        <SidebarLink href="/notices" icon={<IconNotice />} onClick={onClose}>공지사항</SidebarLink>
        <SidebarLink href="/members/me" icon={<IconUser />} exact onClick={onClose}>내 정보</SidebarLink>
        <SidebarLink href="/notifications" icon={<IconBell />} onClick={onClose}>알림</SidebarLink>
      </nav>

      <div className="border-t border-[var(--sidebar-surface)] p-3 space-y-2">
        {isAdmin && (
          <SidebarLink href="/admin" icon={<IconShield />} onClick={onClose}>
            관리자
          </SidebarLink>
        )}

        <Link
          href="/members/me"
          onClick={onClose}
          className="group flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-[var(--sidebar-surface)]"
          aria-label="내 정보로 이동"
        >
          <UserAvatar
            name={user.nickname ?? user.name ?? "?"}
            profileImageUrl={user.profileImageUrl}
            size="xs"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--on-sidebar-active)] group-hover:underline decoration-white/30">
              {user.nickname}
            </p>
          </div>
        </Link>
        <div className="mt-1 flex gap-1">
          <button
            type="button"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="flex flex-1 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--on-sidebar)] transition-colors hover:bg-[var(--sidebar-surface)] hover:text-[var(--on-sidebar-active)] disabled:opacity-50"
          >
            <IconLogout />
            로그아웃
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-[var(--on-sidebar)] transition-colors hover:bg-[var(--sidebar-surface)] hover:text-[var(--on-sidebar-active)]"
            aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
          >
            {theme === "dark" ? <IconSun /> : <IconMoon />}
            <span className="text-xs">{theme === "dark" ? "라이트" : "다크"}</span>
          </button>
        </div>
        <a
          href={ORG_GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="SSAFY Spring Study GitHub 조직"
          className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-[var(--on-sidebar)]/80 transition-colors hover:bg-[var(--sidebar-surface)] hover:text-[var(--on-sidebar-active)]"
        >
          <GitHubIcon className="h-4 w-4 shrink-0" />
          <span>GitHub 조직</span>
        </a>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex sticky top-0 h-screen w-[clamp(12.5rem,16vw,17rem)] shrink-0 flex-col overflow-y-auto bg-[var(--sidebar)] outline outline-1 outline-[var(--ui-card-border-strong)] outline-offset-[-1px] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_10px_30px_-26px_rgba(0,0,0,0.18)]">
        <Link href="/" className="flex h-14 items-center gap-1.5 px-4 hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="로고" width={28} height={28} className="h-7 w-auto" priority />
          <span className="text-sm font-bold text-[var(--on-sidebar-active)]">스터디 플랫폼</span>
        </Link>
        {body}
      </aside>

      {/* Mobile drawer */}
      <div className={`lg:hidden fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
          onClick={onClose}
        />
        <div
          role="dialog"
          aria-modal="true"
          className={`absolute left-0 top-0 h-full w-[min(20rem,85vw)] transform bg-[var(--sidebar)] outline outline-1 outline-[var(--ui-card-border-strong)] outline-offset-[-1px] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_10px_30px_-26px_rgba(0,0,0,0.18)] transition-transform ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-14 items-center justify-between px-4">
            <Link href="/" onClick={onClose} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <Image src="/logo.png" alt="로고" width={28} height={28} className="h-7 w-auto" priority />
              <span className="text-sm font-bold text-[var(--on-sidebar-active)]">스터디 플랫폼</span>
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-lg px-2 py-2 text-[var(--on-sidebar)] hover:bg-[var(--sidebar-surface)] hover:text-[var(--on-sidebar-active)] transition-colors"
              aria-label="사이드바 닫기"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="h-[calc(100%-3.5rem)] overflow-y-auto flex flex-col">
            {body}
          </div>
        </div>
      </div>
    </>
  );
}
