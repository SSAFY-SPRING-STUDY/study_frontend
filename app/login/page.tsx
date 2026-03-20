"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { login } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth-store";

const schema = z.object({
  email: z.string().min(1, "이메일을 입력하세요.").email("올바른 이메일 형식이 아닙니다."),
  password: z.string().min(1, "비밀번호를 입력하세요."),
});
type FormValues = z.infer<typeof schema>;

const inputCls =
  "mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

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
        router.replace("/studies");
      }
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg =
        err?.response?.data?.message ?? "이메일 또는 비밀번호가 올바르지 않습니다.";
      setError("root", { message: msg });
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="로고" width={40} height={40} className="h-10 w-auto" priority />
            <span className="text-2xl font-bold text-gray-900">스터디 플랫폼</span>
          </Link>
          <p className="mt-2 text-sm text-gray-600">학습을 시작해보세요</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-xl font-bold text-gray-900">로그인</h1>
          <form
            onSubmit={handleSubmit((v) => mutation.mutate(v))}
            className="flex flex-col gap-4"
          >
            {errors.root && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-700">{errors.root.message}</p>
              </div>
            )}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                id="login-email"
                type="email"
                {...register("email")}
                placeholder="example@email.com"
                className={inputCls}
              />
              {errors.email && (
                <p role="alert" className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <input
                id="login-password"
                type="password"
                {...register("password")}
                className={inputCls}
              />
              {errors.password && (
                <p role="alert" className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {mutation.isPending ? "로그인 중..." : "로그인"}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-sm text-gray-600">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-700">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
