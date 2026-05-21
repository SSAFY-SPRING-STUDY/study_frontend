"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStudy } from "@/lib/api/studies";
import { getAssignments, createAssignment, deleteAssignment } from "@/lib/api/assignments";
import { getStudyMembers } from "@/lib/api/studyMembers";
import { useAuthStore, useIsAdmin } from "@/store/auth-store";
import { AssignmentForm } from "@/components/forms/AssignmentForm";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/lib/toast";
import type { AssignmentRequest } from "@/lib/types/assignment";
import { Button } from "@/components/ui/Button";

const statusLabel: Record<string, string> = {
  APPLIED: "신청",
  COMPLETED: "완료",
};

const statusCls: Record<string, string> = {
  APPLIED: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
};

export default function AssignmentsPage({
  params,
}: {
  params: Promise<{ studyId: string }>;
}) {
  const { studyId } = use(params);
  const id = Number(studyId);
  const isAdmin = useIsAdmin();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: study } = useQuery({
    queryKey: ["studies", id],
    queryFn: () => getStudy(id),
    enabled: !Number.isNaN(id),
  });

  const { data: assignments = [], isPending } = useQuery({
    queryKey: ["studies", id, "assignments"],
    queryFn: () => getAssignments(id),
    enabled: !Number.isNaN(id),
  });

  const { data: membersData } = useQuery({
    queryKey: ["studies", id, "members"],
    queryFn: () => getStudyMembers(id),
    enabled: !Number.isNaN(id),
  });

  const members = membersData?.members ?? [];
  const myRole = members.find((m) => m.memberId === user?.id)?.role;
  const canManage = isAdmin || myRole === "LEADER";

  const createMutation = useMutation({
    mutationFn: (body: AssignmentRequest) => createAssignment(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies", id, "assignments"] });
      setCreateOpen(false);
      showToast("과제가 생성되었습니다.", "success");
    },
    onError: () => showToast("과제 생성에 실패했습니다.", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (assignmentId: number) => deleteAssignment(assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies", id, "assignments"] });
      setDeletingId(null);
      showToast("과제가 삭제되었습니다.", "success");
    },
    onError: () => showToast("과제 삭제에 실패했습니다.", "error"),
  });

  return (
    <div>
      <nav className="flex items-center gap-1 text-sm text-[var(--on-surface)]/50">
        <Link href="/studies" className="hover:text-[var(--on-surface)] transition-colors">스터디</Link>
        <span>/</span>
        <Link href={`/studies/${id}`} className="hover:text-[var(--on-surface)] transition-colors">{study?.name ?? "상세"}</Link>
        <span>/</span>
        <span className="text-[var(--on-surface)] font-medium">과제</span>
      </nav>

      <div className="mt-6 flex items-center justify-between">
        <h1 className="ui-title">과제 목록</h1>
        {canManage && (
          <Button type="button" variant="primary" onClick={() => setCreateOpen(true)}>
            과제 추가
          </Button>
        )}
      </div>

      {canManage && createOpen && (
        <AssignmentForm
          onSubmit={(v) => createMutation.mutate(v)}
          onCancel={() => setCreateOpen(false)}
          isPending={createMutation.isPending}
        />
      )}

      {isPending ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--surface-container-high)] border-t-[var(--primary)]" role="status" aria-label="로딩 중" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="mt-6 rounded-xl bg-[var(--surface-container-lowest)] p-10 text-center">
          <p className="text-[var(--ui-text-muted)]">등록된 과제가 없습니다.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {assignments.map((a) => (
            <li key={a.assignmentId} className="ui-card">
              <div className="flex items-center gap-3 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface-container-low)] text-xs font-bold text-[var(--on-surface)]/60">
                  {a.orderInStudy}
                </span>
                <Link
                  href={`/studies/${id}/assignments/${a.assignmentId}`}
                  className="flex-1 min-w-0"
                >
                  <span className="font-medium text-[var(--ui-text)] hover:text-[var(--primary)] transition-colors">
                    {a.title}
                  </span>
                </Link>
                {a.myStatus ? (
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCls[a.myStatus]}`}>
                    {statusLabel[a.myStatus]}
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-[var(--surface-container-low)] px-2.5 py-0.5 text-xs font-medium text-[var(--on-surface)]/50">
                    미신청
                  </span>
                )}
                {canManage && (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => setDeletingId(a.assignmentId)}
                    className="shrink-0 px-2.5 py-1 text-xs"
                  >
                    삭제
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {deletingId != null && (
        <ConfirmModal
          message="이 과제를 삭제하시겠습니까?"
          onConfirm={() => deleteMutation.mutate(deletingId)}
          onCancel={() => setDeletingId(null)}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
