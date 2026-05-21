"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStudy } from "@/lib/api/studies";
import {
  getAssignment,
  updateAssignment,
  deleteAssignment,
  applyAssignment,
  getAssignments,
} from "@/lib/api/assignments";
import { getStudyMembers } from "@/lib/api/studyMembers";
import { useAuthStore, useIsAdmin } from "@/store/auth-store";
import { AssignmentForm } from "@/components/forms/AssignmentForm";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/lib/toast";
import type { AssignmentRequest } from "@/lib/types/assignment";
import { Button } from "@/components/ui/Button";

const statusLabel: Record<string, string> = {
  APPLIED: "신청됨",
  COMPLETED: "완료됨",
};

const statusCls: Record<string, string> = {
  APPLIED: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
};

export default function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ studyId: string; assignmentId: string }>;
}) {
  const { studyId, assignmentId } = use(params);
  const sId = Number(studyId);
  const aId = Number(assignmentId);
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: study } = useQuery({
    queryKey: ["studies", sId],
    queryFn: () => getStudy(sId),
    enabled: !Number.isNaN(sId),
  });

  const { data: assignment, isPending, isError } = useQuery({
    queryKey: ["assignments", aId],
    queryFn: () => getAssignment(aId),
    enabled: !Number.isNaN(aId),
  });

  const { data: membersData } = useQuery({
    queryKey: ["studies", sId, "members"],
    queryFn: () => getStudyMembers(sId),
    enabled: !Number.isNaN(sId),
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["studies", sId, "assignments"],
    queryFn: () => getAssignments(sId),
    enabled: !Number.isNaN(sId),
  });

  const members = membersData?.members ?? [];
  const myRole = members.find((m) => m.memberId === user?.id)?.role;
  const isMember = !!myRole;
  const canManage = isAdmin || myRole === "LEADER";
  const myStatus = assignments.find((a) => a.assignmentId === aId)?.myStatus ?? null;

  const updateMutation = useMutation({
    mutationFn: (body: AssignmentRequest) => updateAssignment(aId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments", aId] });
      queryClient.invalidateQueries({ queryKey: ["studies", sId, "assignments"] });
      setEditOpen(false);
      showToast("과제가 수정되었습니다.", "success");
    },
    onError: () => showToast("과제 수정에 실패했습니다.", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAssignment(aId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies", sId, "assignments"] });
      showToast("과제가 삭제되었습니다.", "success");
      router.replace(`/studies/${sId}/assignments`);
    },
    onError: () => showToast("과제 삭제에 실패했습니다.", "error"),
  });

  const applyMutation = useMutation({
    mutationFn: () => applyAssignment(aId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies", sId, "assignments"] });
      showToast("과제를 신청했습니다. GitHub Issue가 생성되었습니다.", "success");
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showToast(err?.response?.data?.message ?? "과제 신청에 실패했습니다.", "error");
    },
  });

  if (Number.isNaN(aId) || isError || (!isPending && !assignment)) {
    return (
      <div>
        <p className="text-[var(--on-surface)]/50">과제를 찾을 수 없습니다.</p>
        <Link href={`/studies/${sId}/assignments`} className="mt-4 inline-block text-sm text-[var(--primary)] hover:underline">
          ← 과제 목록
        </Link>
      </div>
    );
  }

  if (isPending || !assignment) return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--surface-container-high)] border-t-[var(--primary)]" role="status" aria-label="로딩 중" />
    </div>
  );

  return (
    <div>
      <nav className="flex items-center gap-1 text-sm text-[var(--on-surface)]/50">
        <Link href="/studies" className="hover:text-[var(--on-surface)] transition-colors">스터디</Link>
        <span>/</span>
        <Link href={`/studies/${sId}`} className="hover:text-[var(--on-surface)] transition-colors">{study?.name ?? "상세"}</Link>
        <span>/</span>
        <Link href={`/studies/${sId}/assignments`} className="hover:text-[var(--on-surface)] transition-colors">과제</Link>
        <span>/</span>
        <span className="text-[var(--on-surface)] font-medium">{assignment.title}</span>
      </nav>

      <div className="ui-card-static mt-4 p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-[var(--surface-container-low)] px-2.5 py-0.5 text-xs font-medium text-[var(--on-surface)]/60">
                #{assignment.orderInStudy}
              </span>
              <h1 className="ui-title">{assignment.title}</h1>
              {myStatus && (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCls[myStatus]}`}>
                  {statusLabel[myStatus]}
                </span>
              )}
            </div>
            <p className="mt-1 text-label text-[var(--on-surface)]/40">
              생성: {new Date(assignment.createdAt).toLocaleDateString("ko-KR")}
              {assignment.updatedAt !== assignment.createdAt && (
                <> · 수정: {new Date(assignment.updatedAt).toLocaleDateString("ko-KR")}</>
              )}
            </p>
          </div>

          <div className="flex shrink-0 gap-2">
            {isMember && !myStatus && (
              <Button
                type="button"
                variant="primary"
                onClick={() => applyMutation.mutate()}
                disabled={applyMutation.isPending}
              >
                {applyMutation.isPending ? "처리 중..." : "과제 신청"}
              </Button>
            )}
            {canManage && (
              <>
                <Button type="button" variant="outline" onClick={() => setEditOpen(true)} className="px-3 py-1.5 text-sm">
                  수정
                </Button>
                <Button type="button" variant="danger" onClick={() => setDeleteOpen(true)} className="px-3 py-1.5 text-sm">
                  삭제
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="h-px bg-[var(--surface-container-high)] mt-8 mb-6" />
        <h2 className="text-label text-[var(--ui-text-subtle)]">과제 내용</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--ui-text-muted)]">{assignment.content}</p>

        {assignment.prTemplate && (
          <>
            <div className="h-px bg-[var(--surface-container-high)] mt-8 mb-6" />
            <h2 className="text-label text-[var(--ui-text-subtle)]">PR 템플릿</h2>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-[var(--surface-container-low)] p-4 text-xs text-[var(--on-surface)]/75 font-mono">
              {assignment.prTemplate}
            </pre>
          </>
        )}
      </div>

      {canManage && editOpen && (
        <AssignmentForm
          defaultValues={{
            title: assignment.title,
            content: assignment.content,
            prTemplate: assignment.prTemplate ?? "",
            orderInStudy: assignment.orderInStudy,
          }}
          onSubmit={(v) => updateMutation.mutate(v)}
          onCancel={() => setEditOpen(false)}
          isPending={updateMutation.isPending}
        />
      )}

      {deleteOpen && (
        <ConfirmModal
          message="이 과제를 삭제하시겠습니까?"
          onConfirm={() => deleteMutation.mutate()}
          onCancel={() => setDeleteOpen(false)}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
