"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserAvatar } from "@/components/ui/UserAvatar";
import {
  getMe,
  updateMe,
  updateMyPassword,
  updateMyDescription,
  getProfileImageUploadUrl,
  uploadImageToS3,
  updateMyProfileImage,
  deleteMyProfileImage,
  getGithubConnectUrl,
} from "@/lib/api/members";
import { useToast } from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { ImageCropModal } from "@/components/ui/ImageCropModal";

// input 스타일은 globals.css의 Form Style Guide(.ui-field) 사용

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

const GITHUB_CONNECT_ERROR_MESSAGES: Record<string, string> = {
  already_used: "이미 다른 계정에 연결된 GitHub 계정입니다.",
  state_invalid: "GitHub 연결 요청이 만료되었습니다. 다시 시도해주세요.",
  denied: "GitHub 연결을 취소했습니다.",
  oauth_failed: "GitHub 인증에 실패했습니다.",
  invalid_request: "잘못된 요청입니다.",
  internal: "GitHub 연결 중 오류가 발생했습니다.",
};

function MyProfilePageInner() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: user, isPending } = useQuery({
    queryKey: ["members", "me"],
    queryFn: getMe,
    staleTime: 0, // profileImageUrl은 60분 유효 presigned URL이므로 매번 갱신
  });

  // GitHub 연결 콜백 결과 처리 (?github=connected | error&reason=...)
  useEffect(() => {
    const githubResult = searchParams.get("github");
    if (!githubResult) return;

    if (githubResult === "connected") {
      showToast("GitHub 계정이 연결되었습니다.", "success");
      queryClient.invalidateQueries({ queryKey: ["members", "me"] });
    } else if (githubResult === "error") {
      const reason = searchParams.get("reason") ?? "internal";
      const message = GITHUB_CONNECT_ERROR_MESSAGES[reason] ?? "GitHub 연결에 실패했습니다.";
      showToast(message, "error");
    }
    // URL 쿼리 제거 (새로고침/공유 시 토스트 재발생 방지)
    router.replace("/members/me");
  }, [searchParams, showToast, queryClient, router]);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: user ? { name: user.name, nickname: user.nickname } : undefined,
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

  const updateDescription = useMutation({
    mutationFn: updateMyDescription,
    onSuccess: (data) => {
      if (data) queryClient.setQueryData(["members", "me"], data);
      setEditingDescription(false);
      showToast("자기소개가 수정되었습니다.", "success");
    },
    onError: () => {
      showToast("자기소개 수정에 실패했습니다.", "error");
    },
  });

  const deleteProfileImage = useMutation({
    mutationFn: deleteMyProfileImage,
    onSuccess: (data) => {
      if (data) queryClient.setQueryData(["members", "me"], data);
      showToast("프로필 이미지가 삭제되었습니다.", "success");
    },
    onError: () => {
      showToast("프로필 이미지 삭제에 실패했습니다.", "error");
    },
  });

  function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCropSrc(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleCropConfirm(croppedFile: File) {
    setCropSrc(null);
    setImageUploading(true);
    try {
      const urlData = await getProfileImageUploadUrl({
        contentType: croppedFile.type,
        contentLength: croppedFile.size,
      });
      if (!urlData) throw new Error("URL 발급 실패");

      await uploadImageToS3(urlData.presignedUrl, croppedFile);

      const updated = await updateMyProfileImage({ imageKey: urlData.imageKey });
      if (updated) queryClient.setQueryData(["members", "me"], updated);
      showToast("프로필 이미지가 변경되었습니다.", "success");
    } catch {
      showToast("프로필 이미지 업로드에 실패했습니다.", "error");
    } finally {
      setImageUploading(false);
    }
  }

  if (isPending || !user) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--surface-container-high)] border-t-[var(--primary)]" role="status" aria-label="로딩 중" />
      </div>
    );
  }

  return (
    <>
    {cropSrc && (
      <ImageCropModal
        imageSrc={cropSrc}
        onConfirm={handleCropConfirm}
        onCancel={() => setCropSrc(null)}
      />
    )}
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-6">
        <h1 className="ui-title">내 정보</h1>
        <p className="ui-subtitle">계정/연동/보안 설정을 한 곳에서 관리하세요.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 lg:items-stretch">
        {/* 프로필 요약 */}
        <section className="lg:col-span-4 lg:row-span-3 h-full">
          <div className="ui-card-static p-6 h-full flex flex-col">
            <div className="flex flex-col items-center text-center">
              {/* 프로필 이미지 */}
              <div className="relative group">
                <div className="h-32 w-32 rounded-full bg-[var(--surface-container-low)] outline outline-1 outline-[var(--ui-card-border)] outline-offset-[-1px] shadow-[0_1px_2px_rgba(0,0,0,0.06)] overflow-hidden">
                  <UserAvatar
                    name={user.nickname ?? user.name ?? "?"}
                    profileImageUrl={user.profileImageUrl}
                    size="lg"
                  />
                </div>

                {/* 이미지 변경 오버레이 */}
                <div className="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    disabled={imageUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-white font-medium px-2 py-1 rounded hover:bg-white/20 transition-colors"
                  >
                    {imageUploading ? "업로드 중..." : "변경"}
                  </button>
                  {user.profileImageUrl && (
                    <button
                      type="button"
                      disabled={deleteProfileImage.isPending}
                      onClick={() => deleteProfileImage.mutate()}
                      className="text-xs text-white/80 font-medium px-2 py-1 rounded hover:bg-white/20 transition-colors"
                    >
                      삭제
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageFileChange}
                />
              </div>

              <p className="mt-4 max-w-full truncate text-lg font-semibold text-[var(--ui-text)]">
                {user.nickname || user.name}
              </p>
              <p className="mt-1 max-w-full truncate text-sm text-[var(--ui-text-muted)]">{user.email}</p>

              {/* 자기소개 */}
              <div className="mt-5 w-full rounded-xl bg-[var(--surface-container-low)] p-4 text-left">
                <div className="flex items-center justify-between">
                  <p className="text-label text-[var(--ui-text-subtle)]">소개</p>
                  {!editingDescription && (
                    <button
                      type="button"
                      onClick={() => {
                        setDescriptionDraft(user.description ?? "");
                        setEditingDescription(true);
                      }}
                      className="text-xs text-[var(--primary)] hover:underline"
                    >
                      편집
                    </button>
                  )}
                </div>

                {editingDescription ? (
                  <div className="mt-2">
                    <textarea
                      value={descriptionDraft}
                      onChange={(e) => setDescriptionDraft(e.target.value)}
                      maxLength={500}
                      rows={4}
                      className="ui-field resize-none text-sm"
                      placeholder="자기소개를 입력하세요. (최대 500자)"
                    />
                    <p className="mt-1 text-right text-xs text-[var(--ui-text-muted)]">
                      {descriptionDraft.length}/500
                    </p>
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingDescription(false)}
                        className="text-xs text-[var(--ui-text-muted)] hover:underline"
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        disabled={updateDescription.isPending}
                        onClick={() =>
                          updateDescription.mutate({
                            description: descriptionDraft.trim() || null,
                          })
                        }
                        className="text-xs text-[var(--primary)] font-medium hover:underline disabled:opacity-50"
                      >
                        {updateDescription.isPending ? "저장 중..." : "저장"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-[var(--ui-text-muted)] whitespace-pre-wrap break-words">
                    {user.description ?? "자기소개를 작성해 보세요."}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-auto" />
          </div>
        </section>

        {/* 기본 정보 */}
        <section className="lg:col-span-8">
          <div className="ui-card-static p-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-[var(--ui-text)]">기본 정보</h2>
              <p className="mt-1 text-sm text-[var(--ui-text-muted)]">이름과 닉네임을 수정할 수 있어요.</p>
            </div>

            <form
              onSubmit={profileForm.handleSubmit((v) =>
                updateProfile.mutate({
                  ...(v.name !== undefined && v.name !== user.name && { name: v.name }),
                  ...(v.nickname !== undefined && v.nickname !== user.nickname && { nickname: v.nickname }),
                })
              )}
              className="grid gap-4 sm:grid-cols-2"
            >
              <div className="sm:col-span-1">
                <label className="ui-label">이름</label>
                <input {...profileForm.register("name")} className="ui-field" />
              </div>
              <div className="sm:col-span-1">
                <label className="ui-label">닉네임</label>
                <input {...profileForm.register("nickname")} className="ui-field" />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" variant="primary" disabled={updateProfile.isPending} className="px-6">
                  {updateProfile.isPending ? "저장 중..." : "저장"}
                </Button>
              </div>
            </form>
          </div>
        </section>

        {/* GitHub 연결 */}
        <section className="lg:col-span-8">
          <div className="ui-card-static p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-[var(--ui-text)]">GitHub 계정 연결</h2>
                {user.githubUsername ? (
                  <p className="mt-1 text-sm text-[var(--ui-text-muted)]">
                    <span className="font-medium text-[var(--ui-text)]">@{user.githubUsername}</span>으로 연결됨
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-[var(--ui-text-muted)]">스터디 참여 및 과제 신청에 필요합니다.</p>
                )}
              </div>

              {user.githubUsername ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  연결됨
                </span>
              ) : (
                <a href={getGithubConnectUrl()} className="ui-btn ui-btn-outline px-3 py-1.5 text-sm">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  연결하기
                </a>
              )}
            </div>
          </div>
        </section>

        {/* 비밀번호 */}
        <section className="lg:col-span-8">
          <div className="ui-card-static p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[var(--ui-text)]">비밀번호</h2>
                <p className="mt-1 text-sm text-[var(--ui-text-muted)]">계정 보안을 위해 주기적으로 변경하세요.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordForm((b) => !b)}
                className="ui-btn ui-btn-outline px-3 py-1.5 text-sm"
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
                className="mt-5 grid gap-4 sm:grid-cols-2"
              >
                <div className="sm:col-span-2">
                  <label className="ui-label">현재 비밀번호</label>
                  <input type="password" {...passwordForm.register("currentPassword")} className="ui-field" />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-1">
                  <label className="ui-label">새 비밀번호</label>
                  <input type="password" {...passwordForm.register("newPassword")} className="ui-field" />
                </div>
                <div className="sm:col-span-1">
                  <label className="ui-label">새 비밀번호 확인</label>
                  <input type="password" {...passwordForm.register("newPasswordConfirm")} className="ui-field" />
                  {passwordForm.formState.errors.newPasswordConfirm && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordForm.formState.errors.newPasswordConfirm.message}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <Button type="submit" variant="primary" disabled={updatePassword.isPending} className="px-6">
                    {updatePassword.isPending ? "변경 중..." : "비밀번호 변경"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
    </>
  );
}

export default function MyProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--surface-container-high)] border-t-[var(--primary)]" role="status" aria-label="로딩 중" />
        </div>
      }
    >
      <MyProfilePageInner />
    </Suspense>
  );
}
