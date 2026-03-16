"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, updateMe, updateMyPassword } from "@/lib/api/members";
import { useToast } from "@/lib/toast";

const inputCls =
  "mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors";

const profileSchema = z.object({
  name: z.string().max(50).optional(),
  nickname: z.string().min(3).max(50).optional(),
});
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "현재 비밀번호를 입력하세요."),
    newPassword: z.string().min(8).max(30),
    newPasswordConfirm: z.string(),
  })
  .refine((d) => d.newPassword === d.newPasswordConfirm, {
    message: "새 비밀번호가 일치하지 않습니다.",
    path: ["newPasswordConfirm"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function MyProfilePage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const { data: user, isPending } = useQuery({
    queryKey: ["members", "me"],
    queryFn: getMe,
  });

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: user ? { name: user.name, nickname: user.nickName } : undefined,
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const updateProfile = useMutation({
    mutationFn: updateMe,
    onSuccess: (data) => {
      if (data) queryClient.setQueryData(["members", "me"], data);
      showToast("정보가 수정되었습니다.", "success");
    },
    onError: () => {
      showToast("정보 수정에 실패했습니다.", "error");
    },
  });

  const updatePassword = useMutation({
    mutationFn: updateMyPassword,
    onSuccess: () => {
      passwordForm.reset();
      setShowPasswordForm(false);
      showToast("비밀번호가 변경되었습니다.", "success");
    },
    onError: () => {
      showToast("비밀번호 변경에 실패했습니다.", "error");
    },
  });

  if (isPending || !user) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" role="status" aria-label="로딩 중" />
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">내 정보</h1>
        <p className="mt-1 text-sm text-gray-600">프로필 정보를 관리하세요.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Email (read-only) */}
        <div className="px-6 py-5 border-b border-gray-100">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">이메일</p>
          <p className="mt-1 font-medium text-gray-900">{user.email}</p>
        </div>

        {/* Profile form */}
        <div className="px-6 py-5">
          <h2 className="text-sm font-semibold text-gray-900">프로필 수정</h2>
          <form
            onSubmit={profileForm.handleSubmit((v) =>
              updateProfile.mutate({
                ...(v.name !== undefined && v.name !== user.name && { name: v.name }),
                ...(v.nickname !== undefined &&
                  v.nickname !== user.nickName && { nickname: v.nickname }),
              })
            )}
            className="mt-4 flex flex-col gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">이름</label>
              <input {...profileForm.register("name")} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">닉네임</label>
              <input {...profileForm.register("nickname")} className={inputCls} />
            </div>
            <div>
              <button
                type="submit"
                disabled={updateProfile.isPending}
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {updateProfile.isPending ? "저장 중..." : "저장"}
              </button>
            </div>
          </form>
        </div>

        {/* Password section */}
        <div className="border-t border-gray-100 px-6 py-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">비밀번호</h2>
            <button
              type="button"
              onClick={() => setShowPasswordForm((b) => !b)}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {showPasswordForm ? "취소" : "변경"}
            </button>
          </div>
          {showPasswordForm && (
            <form
              onSubmit={passwordForm.handleSubmit((v) =>
                updatePassword.mutate({
                  currentPassword: v.currentPassword,
                  newPassword: v.newPassword,
                })
              )}
              className="mt-4 flex flex-col gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">현재 비밀번호</label>
                <input
                  type="password"
                  {...passwordForm.register("currentPassword")}
                  className={inputCls}
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">새 비밀번호</label>
                <input
                  type="password"
                  {...passwordForm.register("newPassword")}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">새 비밀번호 확인</label>
                <input
                  type="password"
                  {...passwordForm.register("newPasswordConfirm")}
                  className={inputCls}
                />
                {passwordForm.formState.errors.newPasswordConfirm && (
                  <p className="mt-1 text-sm text-red-600">
                    {passwordForm.formState.errors.newPasswordConfirm.message}
                  </p>
                )}
              </div>
              <div>
                <button
                  type="submit"
                  disabled={updatePassword.isPending}
                  className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {updatePassword.isPending ? "변경 중..." : "비밀번호 변경"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
