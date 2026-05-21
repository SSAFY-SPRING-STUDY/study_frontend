"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { login, getGithubLoginUrl } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth-store";
import { getMe } from "@/lib/api/members";
import { Suspense, useEffect, useState } from "react";

const schema = z.object({
  email: z.string().min(1, "이메일을 입력하세요.").email("올바른 이메일 형식이 아닙니다."),
  password: z.string().min(1, "비밀번호를 입력하세요."),
});
type FormValues = z.infer<typeof schema>;

function sanitizeRedirect(redirect: string | null | undefined): string {
  // open redirect 방지: 같은 사이트 내부 경로만 허용
  if (!redirect) return "/studies";
  if (!redirect.startsWith("/") || redirect.startsWith("//")) return "/studies";
  if (redirect === "/login" || redirect === "/signup") return "/studies";
  return redirect;
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = sanitizeRedirect(searchParams.get("redirect"));
  const setUser = useAuthStore((s) => s.setUser);
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirectingGithub, setIsRedirectingGithub] = useState(false);

  useEffect(() => {
    if (isRedirectingGithub) {
      window.location.href = getGithubLoginUrl();
    }
  }, [isRedirectingGithub]);

  const { data: me, isPending: isCheckingAuth } = useQuery({
    queryKey: ["members", "me"],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (me) {
      setUser(me);
      router.replace(redirectTo);
    }
  }, [me, setUser, router, redirectTo]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      if (data) {
        setUser(data);
        router.replace(redirectTo);
      }
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg =
        err?.response?.data?.message ?? "이메일 또는 비밀번호가 올바르지 않습니다.";
      setError("root", { message: msg });
    },
  });

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface)]">
        <p className="text-[var(--on-surface)]/50">로그인 확인 중...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface)] px-4">
      {isRedirectingGithub && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--surface)]/85 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className="h-10 w-10 animate-spin rounded-full border-[3px] border-[var(--surface-container-high)] border-t-[var(--primary)]"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-[var(--on-surface)]/80">
              GitHub으로 이동 중입니다…
            </p>
            <p className="text-xs text-[var(--on-surface)]/50">
              잠시 시간이 걸릴 수 있습니다.
            </p>
          </div>
        </div>
      )}
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="로고" width={40} height={40} className="h-10 w-auto" priority />
            <span className="text-2xl font-bold text-[var(--on-surface)]">스터디 플랫폼</span>
          </Link>
          <p className="mt-2 text-sm text-[var(--on-surface)]/60">학습을 시작해보세요</p>
        </div>

        <div className="rounded-2xl bg-[var(--surface-container-lowest)] p-8 shadow-ambient">
          <h1 className="mb-6 text-headline-md text-[var(--on-surface)]">로그인</h1>
          <form
            onSubmit={handleSubmit((v) => mutation.mutate(v))}
            className="flex flex-col gap-4"
          >
            {errors.root && (
              <div className="rounded-lg bg-red-50/80 px-4 py-3">
                <p className="text-sm text-red-700">{errors.root.message}</p>
              </div>
            )}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-[var(--on-surface)]/70">
                이메일
              </label>
              <input
                id="login-email"
                type="email"
                {...register("email")}
                placeholder="example@email.com"
                className="ui-field"
              />
              {errors.email && (
                <p role="alert" className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="block text-sm font-medium text-[var(--on-surface)]/70">
                  비밀번호
                </label>
                <Link
                  href="/password-reset"
                  className="text-xs font-medium text-[var(--primary)] hover:underline"
                >
                  비밀번호 찾기
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="ui-field pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--on-surface)]/55 hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)] transition-colors"
                  aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.477 10.48a3 3 0 104.243 4.243" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 4.24A10.94 10.94 0 0112 4c5.523 0 10 4 11 8-0.3 1.2-1 2.7-2.2 4.1M6.23 6.23C4.25 7.65 2.9 9.6 2 12c1 4 5.477 8 11 8 1.49 0 2.91-.29 4.2-.8" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.636-7 10-7 10 7 10 7-3.636 7-10 7-10-7-10-7z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p role="alert" className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="mt-2 inline-flex w-full items-center justify-center rounded-[1.5rem] bg-gradient-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {mutation.isPending ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div className="mt-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--surface-container-high)]" />
            <span className="text-xs text-[var(--on-surface)]/40">또는</span>
            <div className="h-px flex-1 bg-[var(--surface-container-high)]" />
          </div>

          <button
            type="button"
            onClick={() => setIsRedirectingGithub(true)}
            disabled={isRedirectingGithub}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--surface-container-low)] px-4 py-2.5 text-sm font-medium text-[var(--on-surface)]/70 hover:bg-[var(--surface-container-high)] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRedirectingGithub ? (
              <>
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--on-surface)]/20 border-t-[var(--on-surface)]/70"
                  aria-hidden="true"
                />
                GitHub으로 이동 중...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub으로 로그인
              </>
            )}
          </button>
        </div>
        <p className="mt-4 text-center text-sm text-[var(--on-surface)]/60">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="font-medium text-[var(--primary)] hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--surface)]">
          <p className="text-[var(--on-surface)]/50">로그인 페이지 준비 중...</p>
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}
