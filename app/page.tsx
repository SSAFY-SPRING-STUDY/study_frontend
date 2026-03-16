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
      <div className="py-16 text-center">
        {isLoggedIn ? (
          <>
            <h1 className="text-2xl font-bold text-neutral-900">
              {(user ?? me)?.name || (user ?? me)?.nickName}님, 환영합니다
            </h1>
            <p className="mt-4 text-neutral-600">
              스터디 목록과 공지사항을 이용해 보세요.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/studies"
                className="rounded-lg bg-neutral-900 px-6 py-3 text-white hover:bg-neutral-700"
              >
                스터디 목록
              </Link>
              <Link
                href="/notices"
                className="rounded-lg border border-neutral-300 px-6 py-3 text-neutral-700 hover:bg-neutral-100"
              >
                공지사항
              </Link>
              <Link
                href="/members/me"
                className="rounded-lg border border-neutral-300 px-6 py-3 text-neutral-700 hover:bg-neutral-100"
              >
                내 정보
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-neutral-900">
              스터디 플랫폼에 오신 것을 환영합니다
            </h1>
            <p className="mt-4 text-neutral-600">
              로그인 후 스터디 목록과 공지사항을 이용할 수 있습니다.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/login"
                className="rounded-lg bg-neutral-900 px-6 py-3 text-white hover:bg-neutral-700"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="rounded-lg border border-neutral-300 px-6 py-3 text-neutral-700 hover:bg-neutral-100"
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
