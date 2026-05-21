"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { confirmPasswordReset } from "@/lib/api/auth";
import { showToast } from "@/lib/toast";

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, "비밀번호는 8자 이상이어야 합니다.")
      .max(30, "비밀번호는 30자 이하이어야 합니다."),
    passwordConfirm: z.string(),
  })
  .refine((d) => d.newPassword === d.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordConfirm"],
  });
type FormValues = z.infer<typeof schema>;

function PasswordResetConfirmContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (v: FormValues) => confirmPasswordReset(token ?? "", v.newPassword),
    onSuccess: () => {
      showToast("비밀번호가 성공적으로 재설정되었습니다. 다시 로그인해주세요.", "success");
      router.replace("/login");
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg =
        err?.response?.data?.message ??
        "유효하지 않거나 만료된 재설정 토큰입니다.";
      setError("root", { message: msg });
    },
  });

  // 토큰이 아예 없는 경우 안내 화면
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface)] px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center hover:opacity-80 transition-opacity">
              <Image src="/logo.png" alt="로고" width={40} height={40} className="h-10 w-auto" priority />
              <span className="text-2xl font-bold text-[var(--on-surface)]">스터디 플랫폼</span>
            </Link>
          </div>
          <div className="rounded-2xl bg-[var(--surface-container-lowest)] p-8 shadow-ambient">
            <h1 className="mb-2 text-headline-md text-[var(--on-surface)]">잘못된 접근입니다</h1>
            <p className="mb-6 text-sm text-[var(--on-surface)]/60">
              비밀번호 재설정 링크가 유효하지 않습니다. 메일의 링크를 다시 확인해주세요.
            </p>
            <Link
              href="/password-reset"
              className="inline-flex w-full items-center justify-center rounded-[1.5rem] bg-gradient-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              재설정 메일 다시 받기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface)] px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="로고" width={40} height={40} className="h-10 w-auto" priority />
            <span className="text-2xl font-bold text-[var(--on-surface)]">스터디 플랫폼</span>
          </Link>
          <p className="mt-2 text-sm text-[var(--on-surface)]/60">새 비밀번호를 설정해주세요</p>
        </div>

        <div className="rounded-2xl bg-[var(--surface-container-lowest)] p-8 shadow-ambient">
          <h1 className="mb-6 text-headline-md text-[var(--on-surface)]">비밀번호 재설정</h1>
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
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-[var(--on-surface)]/70"
              >
                새 비밀번호 (8~30자)
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  {...register("newPassword")}
                  placeholder="8자 이상"
                  className="ui-field pr-11"
                  autoComplete="new-password"
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
              {errors.newPassword && (
                <p role="alert" className="mt-1 text-xs text-red-600">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="password-confirm"
                className="block text-sm font-medium text-[var(--on-surface)]/70"
              >
                비밀번호 확인
              </label>
              <input
                id="password-confirm"
                type={showPassword ? "text" : "password"}
                {...register("passwordConfirm")}
                placeholder="비밀번호 다시 입력"
                className="ui-field"
                autoComplete="new-password"
              />
              {errors.passwordConfirm && (
                <p role="alert" className="mt-1 text-xs text-red-600">
                  {errors.passwordConfirm.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="mt-2 inline-flex w-full items-center justify-center rounded-[1.5rem] bg-gradient-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {mutation.isPending ? "변경 중..." : "비밀번호 변경"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-[var(--on-surface)]/60">
          <Link href="/login" className="font-medium text-[var(--primary)] hover:underline">
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function PasswordResetConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--surface)]">
          <p className="text-[var(--on-surface)]/50">불러오는 중...</p>
        </div>
      }
    >
      <PasswordResetConfirmContent />
    </Suspense>
  );
}
