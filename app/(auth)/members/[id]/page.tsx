"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getMember } from "@/lib/api/members";
import { useAuthStore } from "@/store/auth-store";
import { LEVEL_LABEL } from "@/lib/constants";
import type { StudyLevel } from "@/lib/types/study";

export default function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const currentUser = useAuthStore((s) => s.user);
  const memberId = Number(id);

  const { data: member, isPending, isError } = useQuery({
    queryKey: ["members", memberId],
    queryFn: () => getMember(memberId),
    enabled: !Number.isNaN(memberId),
  });

  if (Number.isNaN(memberId) || isError || (!isPending && !member)) {
    return (
      <div>
        <p className="text-neutral-500">회원을 찾을 수 없습니다.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-neutral-600 underline">
          홈으로
        </Link>
      </div>
    );
  }

  if (isPending || !member) {
    return <p className="text-neutral-500">로딩 중...</p>;
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold text-neutral-900">회원 정보</h1>
      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
        <p className="text-sm text-neutral-500">이름</p>
        <p className="mt-1 font-medium text-neutral-900">{member.name}</p>
        <p className="mt-4 text-sm text-neutral-500">닉네임</p>
        <p className="mt-1 font-medium text-neutral-900">{member.nickName}</p>
        <p className="mt-4 text-sm text-neutral-500">레벨</p>
        <p className="mt-1 font-medium text-neutral-900">
          {LEVEL_LABEL[member.level as StudyLevel] ?? member.level}
        </p>
        {currentUser?.id === member.id && (
          <Link
            href="/members/me"
            className="mt-6 inline-block text-sm text-neutral-600 underline"
          >
            내 정보 수정
          </Link>
        )}
      </div>
    </div>
  );
}
