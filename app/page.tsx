"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api/members";
import { useAuthStore } from "@/store/auth-store";
import { MainLayout } from "@/components/layout/MainLayout";


export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const { data: me } = useQuery({
    queryKey: ["members", "me"],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (me) setUser(me);
  }, [me, setUser]);

  const isLoggedIn = !!user || !!me;

  return (
    <MainLayout>
      <div
        className="py-24 text-center"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, color-mix(in srgb, var(--primary-container) 8%, transparent), transparent)" }}
      >
        {isLoggedIn ? (
          <>
            <h1 className="text-display-lg text-[var(--on-surface)] max-w-2xl mx-auto">
              {(user ?? me)?.name || (user ?? me)?.nickname}님, 환영합니다
            </h1>
            <p className="mt-6 text-lg text-[var(--on-surface)]/60 max-w-xl mx-auto">
              스터디 목록과 공지사항을 이용해 보세요.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                href="/studies"
                className="rounded-[1.5rem] bg-gradient-primary px-8 py-3 text-white font-medium hover:opacity-90 transition-opacity"
              >
                스터디 목록
              </Link>
              <Link
                href="/notices"
                className="rounded-[1.5rem] px-8 py-3 text-[var(--primary)] font-medium hover:bg-[var(--surface-container-low)] transition-colors"
              >
                공지사항
              </Link>
              <Link
                href="/members/me"
                className="rounded-[1.5rem] px-8 py-3 text-[var(--primary)] font-medium hover:bg-[var(--surface-container-low)] transition-colors"
              >
                내 정보
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-display-lg text-[var(--on-surface)] max-w-2xl mx-auto">
              스터디 플랫폼에 오신 것을 환영합니다
            </h1>
            <p className="mt-6 text-lg text-[var(--on-surface)]/60 max-w-xl mx-auto">
              로그인 후 스터디 목록과 공지사항을 이용할 수 있습니다.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                href="/login"
                className="rounded-[1.5rem] bg-gradient-primary px-8 py-3 text-white font-medium hover:opacity-90 transition-opacity"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="rounded-[1.5rem] px-8 py-3 text-[var(--primary)] font-medium hover:bg-[var(--surface-container-low)] transition-colors"
              >
                회원가입
              </Link>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
