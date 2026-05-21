"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { getAdminMember, updateAdminMember } from "@/lib/api/adminMembers";
import { useToast } from "@/lib/toast";
import type { MemberRole, MemberLevel } from "@/lib/types/member";

const schema = z.object({
  name: z.string().max(50).optional(),
  nickname: z.string().min(1).max(50).optional(),
  role: z.enum(["ROLE_USER", "ROLE_ADMIN"]).optional(),
  level: z.enum(["BASIC", "INTERMEDIATE", "ADVANCED"]).optional(),
});
type FormValues = z.infer<typeof schema>;

const ROLE_OPTIONS: { value: MemberRole; label: string }[] = [
  { value: "ROLE_USER", label: "일반 (ROLE_USER)" },
  { value: "ROLE_ADMIN", label: "관리자 (ROLE_ADMIN)" },
];

const LEVEL_OPTIONS: { value: MemberLevel; label: string }[] = [
  { value: "BASIC", label: "BASIC" },
  { value: "INTERMEDIATE", label: "INTERMEDIATE" },
  { value: "ADVANCED", label: "ADVANCED" },
];

export default function AdminMemberDetailPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = use(params);
  const id = Number(memberId);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: member, isPending } = useQuery({
    queryKey: ["admin", "members", id],
    queryFn: () => getAdminMember(id),
    enabled: !Number.isNaN(id),
  });

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: member
      ? { name: member.name, nickname: member.nickname, role: member.role, level: member.level }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: (body: FormValues) => updateAdminMember(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "members"] });
      showToast("회원 정보가 수정되었습니다.", "success");
      router.push("/admin/members");
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showToast(err?.response?.data?.message ?? "수정에 실패했습니다.", "error");
    },
  });

  if (Number.isNaN(id)) {
    return <p className="text-red-600">잘못된 회원 ID입니다.</p>;
  }

  if (isPending) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--surface-container-high)] border-t-[var(--primary)]" role="status" aria-label="로딩 중" />
      </div>
    );
  }

  if (!member) {
    return (
      <div>
        <p className="text-[var(--on-surface)]/50">존재하지 않는 회원입니다.</p>
        <Link href="/admin/members" className="mt-4 inline-block text-sm text-[var(--primary)] hover:underline">
          ← 목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <nav className="mb-6 flex items-center gap-1 text-sm text-[var(--on-surface)]/50">
        <Link href="/admin" className="hover:text-[var(--on-surface)] transition-colors">관리자</Link>
        <span>/</span>
        <Link href="/admin/members" className="hover:text-[var(--on-surface)] transition-colors">회원 관리</Link>
        <span>/</span>
        <span className="text-[var(--on-surface)] font-medium">{member.nickname}</span>
      </nav>

      {/* 회원 정보 요약 */}
      <div className="mb-6 rounded-xl bg-[var(--surface-container-low)] p-5">
        <p className="text-label text-[var(--on-surface)]/40">ID: {member.id}</p>
        <p className="mt-1 font-semibold text-[var(--on-surface)]">{member.email}</p>
      </div>

      <form
        onSubmit={handleSubmit((v) => mutation.mutate(v))}
        className="rounded-xl bg-[var(--surface-container-lowest)] p-6 shadow-ambient"
      >
        <h2 className="mb-5 text-label text-[var(--on-surface)]/60">정보 수정</h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="ui-label">이름</label>
            <input {...register("name")} className="ui-field" />
            {errors.name && <p role="alert" className="ui-error">{errors.name.message}</p>}
          </div>

          <div>
            <label className="ui-label">닉네임</label>
            <input {...register("nickname")} className="ui-field" />
            {errors.nickname && <p role="alert" className="ui-error">{errors.nickname.message}</p>}
          </div>

          <div>
            <label className="ui-label">레벨</label>
            <select {...register("level")} className="ui-field">
              {LEVEL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="ui-label">권한</label>
            <select {...register("role")} className="ui-field">
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="submit"
            disabled={mutation.isPending || !isDirty}
            className="inline-flex items-center rounded-[1.5rem] bg-gradient-primary px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {mutation.isPending ? "저장 중..." : "저장"}
          </button>
          <Link
            href="/admin/members"
            className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-[var(--primary)] hover:bg-[var(--surface-container-low)] transition-colors"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
