"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { requestPasswordReset } from "@/lib/api/auth";
import { showToast } from "@/lib/toast";

const schema = z.object({
  email: z
    .string()
    .min(1, "이메일을 입력하세요.")
    .email("올바른 이메일 형식이 아닙니다.")
    .max(100, "이메일은 100자 이하이어야 합니다."),
});
type FormValues = z.infer<typeof schema>;

export default function PasswordResetRequestPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (v: FormValues) => requestPasswordReset(v.email),
    onSuccess: () => {
      setSubmitted(true);
      showToast("재설정 메일을 발송했습니다. 메일함을 확인해주세요.", "success");
    },
    onError: () => {
      showToast("요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", "error");
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface)] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="로고" width={40} height={40} className="h-10 w-auto" priority />
            <span className="text-2xl font-bold text-[var(--on-surface)]">스터디 플랫폼</span>
          </Link>
          <p className="mt-2 text-sm text-[var(--on-surface)]/60">비밀번호를 잊으셨나요?</p>
        </div>

        <div className="rounded-2xl bg-[var(--surface-container-lowest)] p-8 shadow-ambient">
          <h1 className="mb-2 text-headline-md text-[var(--on-surface)]">비밀번호 찾기</h1>
          <p className="mb-6 text-sm text-[var(--on-surface)]/60">
            가입하신 이메일을 입력하시면 재설정 링크를 보내드립니다.
          </p>

          {submitted ? (
            <div className="flex flex-col gap-4">
              <div className="rounded-lg bg-[var(--surface-container-low)] px-4 py-3 text-sm text-[var(--on-surface)]/80">
                <p className="font-medium text-[var(--on-surface)]">메일을 확인해주세요.</p>
                <p className="mt-1 text-[var(--on-surface)]/60">
                  입력하신 이메일이 가입된 계정이라면 재설정 링크가 발송되었습니다.
                  메일이 도착하지 않으면 스팸함을 확인하거나 잠시 후 다시 시도해주세요.
                </p>
              </div>
              <Link
                href="/login"
                className="mt-2 inline-flex w-full items-center justify-center rounded-[1.5rem] bg-gradient-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                로그인으로 돌아가기
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit((v) => mutation.mutate(v))}
              className="flex flex-col gap-4"
            >
              <div>
                <label
                  htmlFor="reset-email"
                  className="block text-sm font-medium text-[var(--on-surface)]/70"
                >
                  이메일
                </label>
                <input
                  id="reset-email"
                  type="email"
                  {...register("email")}
                  placeholder="example@email.com"
                  className="ui-field"
                  autoComplete="email"
                />
                {errors.email && (
                  <p role="alert" className="mt-1 text-xs text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="mt-2 inline-flex w-full items-center justify-center rounded-[1.5rem] bg-gradient-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {mutation.isPending ? "발송 중..." : "재설정 메일 발송"}
              </button>
            </form>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-[var(--on-surface)]/60">
          비밀번호가 기억나셨나요?{" "}
          <Link href="/login" className="font-medium text-[var(--primary)] hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
