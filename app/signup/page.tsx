"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { signup } from "@/lib/api/members";

const schema = z
  .object({
    email: z.string().min(1).max(100).email(),
    password: z.string().min(8, "8자 이상 입력하세요.").max(30),
    passwordConfirm: z.string(),
    name: z.string().min(1).max(50),
    nickname: z.string().min(1, "닉네임은 필수입니다.").max(50, "닉네임은 50자 이하이어야 합니다."),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordConfirm"],
  });
type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      router.replace("/login?signed=1");
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setError("root", {
        message: err?.response?.data?.message ?? "회원가입에 실패했습니다.",
      });
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface)] px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="로고" width={40} height={40} className="h-10 w-auto" priority />
            <span className="text-2xl font-bold text-[var(--on-surface)]">스터디 플랫폼</span>
          </Link>
          <p className="mt-2 text-sm text-[var(--on-surface)]/60">지금 시작해보세요</p>
        </div>

        <div className="rounded-2xl bg-[var(--surface-container-lowest)] p-8 shadow-ambient">
          <h1 className="mb-6 text-headline-md text-[var(--on-surface)]">회원가입</h1>
          <form
            onSubmit={handleSubmit((v) =>
              mutation.mutate({
                email: v.email,
                password: v.password,
                name: v.name,
                nickname: v.nickname,
              })
            )}
            className="flex flex-col gap-4"
          >
            {errors.root && (
              <div className="rounded-lg bg-red-50/80 px-4 py-3">
                <p className="text-sm text-red-700">{errors.root.message}</p>
              </div>
            )}
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-[var(--on-surface)]/70">
                이메일
              </label>
              <input
                id="signup-email"
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
              <label htmlFor="signup-password" className="block text-sm font-medium text-[var(--on-surface)]/70">
                비밀번호 (8~30자)
              </label>
              <input
                id="signup-password"
                type="password"
                {...register("password")}
                placeholder="8자 이상"
                className="ui-field"
              />
              {errors.password && (
                <p role="alert" className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="signup-password-confirm" className="block text-sm font-medium text-[var(--on-surface)]/70">
                비밀번호 확인
              </label>
              <input
                id="signup-password-confirm"
                type="password"
                {...register("passwordConfirm")}
                placeholder="비밀번호 다시 입력"
                className="ui-field"
              />
              {errors.passwordConfirm && (
                <p role="alert" className="mt-1 text-xs text-red-600">
                  {errors.passwordConfirm.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="signup-name" className="block text-sm font-medium text-[var(--on-surface)]/70">
                이름
              </label>
              <input
                id="signup-name"
                {...register("name")}
                placeholder="이름"
                className="ui-field"
              />
              {errors.name && (
                <p role="alert" className="mt-1 text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="signup-nickname" className="block text-sm font-medium text-[var(--on-surface)]/70">
                닉네임 (1~50자)
              </label>
              <input
                id="signup-nickname"
                {...register("nickname")}
                placeholder="닉네임"
                className="ui-field"
              />
              {errors.nickname && (
                <p role="alert" className="mt-1 text-xs text-red-600">{errors.nickname.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="mt-2 inline-flex w-full items-center justify-center rounded-[1.5rem] bg-gradient-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {mutation.isPending ? "가입 중..." : "가입하기"}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-sm text-[var(--on-surface)]/60">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-medium text-[var(--primary)] hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
