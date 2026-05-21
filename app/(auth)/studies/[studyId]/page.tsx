"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStudy, updateStudy, deleteStudy } from "@/lib/api/studies";
import { getCurriculumsByStudy, createCurriculum } from "@/lib/api/curriculums";
import { getStudyMembers, joinStudy, leaveStudy } from "@/lib/api/studyMembers";
import { getAssignments } from "@/lib/api/assignments";
import { useAuthStore, useIsAdmin } from "@/store/auth-store";
import { LEVEL_LABEL, TYPE_LABEL } from "@/lib/constants";
import { UserAvatar } from "@/components/ui/UserAvatar";
import type { StudyLevel, StudyType } from "@/lib/types/study";
import { StudyForm } from "@/components/forms/StudyForm";
import { CurriculumForm } from "@/components/forms/CurriculumForm";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/lib/toast";
import { Button } from "@/components/ui/Button";

const joinSchema = z.object({
  githubRepoName: z
    .string()
    .min(1, "레포지토리명을 입력하세요.")
    .regex(/^[a-zA-Z0-9_.-]+$/, "영문·숫자·_·-·. 만 사용 가능합니다."),
});
type JoinForm = z.infer<typeof joinSchema>;

const levelBadgeCls: Record<string, string> = {
  BASIC: "ui-badge ui-badge-basic",
  INTERMEDIATE: "ui-badge ui-badge-intermediate",
  ADVANCED: "ui-badge ui-badge-advanced",
};

const typeBadgeCls: Record<string, string> = {
  BACKEND: "ui-badge ui-badge-backend",
  COMPUTER_SCIENCE: "ui-badge ui-badge-cs",
  ALGORITHM: "ui-badge ui-badge-algorithm",
};


export default function StudyDetailPage({
  params,
}: {
  params: Promise<{ studyId: string }>;
}) {
  const { studyId } = use(params);
  const id = Number(studyId);
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [curriculumOpen, setCurriculumOpen] = useState(false);

  const joinForm = useForm<JoinForm>({
    resolver: zodResolver(joinSchema),
    defaultValues: { githubRepoName: "" },
  });

  const { data: study, isPending, isError } = useQuery({
    queryKey: ["studies", id],
    queryFn: () => getStudy(id),
    enabled: !Number.isNaN(id),
  });

  const { data: curriculums = [] } = useQuery({
    queryKey: ["studies", id, "curriculums"],
    queryFn: () => getCurriculumsByStudy(id),
    enabled: !Number.isNaN(id) && !!study,
  });

  const { data: membersData } = useQuery({
    queryKey: ["studies", id, "members"],
    queryFn: () => getStudyMembers(id),
    enabled: !Number.isNaN(id) && !!study,
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["studies", id, "assignments"],
    queryFn: () => getAssignments(id),
    enabled: !Number.isNaN(id) && !!study,
  });

  const members = membersData?.members ?? [];
  const myMembership = members.find((m) => m.memberId === user?.id);
  const isMember = !!myMembership;
  const isLeader = myMembership?.role === "LEADER";

  const updateMutation = useMutation({
    mutationFn: (body: Parameters<typeof updateStudy>[1]) => updateStudy(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies", id] });
      setEditOpen(false);
      showToast("스터디가 수정되었습니다.", "success");
    },
    onError: () => showToast("스터디 수정에 실패했습니다.", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteStudy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies"] });
      showToast("스터디가 삭제되었습니다.", "success");
      router.replace("/studies");
    },
    onError: () => showToast("스터디 삭제에 실패했습니다.", "error"),
  });

  const joinMutation = useMutation({
    mutationFn: (body: JoinForm) => joinStudy(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies", id, "members"] });
      setJoinOpen(false);
      joinForm.reset();
      showToast("스터디에 참여했습니다.", "success");
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showToast(err?.response?.data?.message ?? "참여에 실패했습니다. GitHub 계정 연동이 필요합니다.", "error");
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => leaveStudy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies", id, "members"] });
      setLeaveOpen(false);
      showToast("스터디를 탈퇴했습니다.", "success");
    },
    onError: () => showToast("탈퇴에 실패했습니다.", "error"),
  });

  const createCurriculumMutation = useMutation({
    mutationFn: (body: Parameters<typeof createCurriculum>[1]) => createCurriculum(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies", id, "curriculums"] });
      setCurriculumOpen(false);
      showToast("커리큘럼이 추가되었습니다.", "success");
    },
    onError: () => showToast("커리큘럼 추가에 실패했습니다.", "error"),
  });

  if (Number.isNaN(id) || isError || (!isPending && !study)) {
    return (
      <div>
        <p className="text-[var(--on-surface)]/50">스터디를 찾을 수 없습니다.</p>
        <Link href="/studies" className="mt-4 inline-block text-sm text-[var(--primary)] hover:underline">목록으로</Link>
      </div>
    );
  }

  if (isPending || !study) return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--surface-container-high)] border-t-[var(--primary)]" role="status" aria-label="로딩 중" />
    </div>
  );

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-[var(--on-surface)]/50">
        <Link href="/studies" className="hover:text-[var(--on-surface)] transition-colors">스터디 목록</Link>
        <span>/</span>
        <span className="text-[var(--on-surface)] font-medium">{study.name}</span>
      </nav>

      {/* Asymmetric layout: wide content + slim sidebar */}
      <div className="mt-4 lg:grid lg:grid-cols-[1fr_280px] lg:gap-8 lg:items-start">
        {/* Main content column */}
        <div>
          {/* Hero */}
          <div className="ui-card-static p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="ui-title">{study.name}</h1>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${levelBadgeCls[study.level] ?? "bg-[var(--surface-container-low)] text-[var(--on-surface)]/60"}`}>
                    {LEVEL_LABEL[study.level] ?? study.level}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${typeBadgeCls[study.type] ?? "bg-[var(--surface-container-low)] text-[var(--on-surface)]/60"}`}>
                    {TYPE_LABEL[study.type] ?? study.type}
                  </span>
                  {isMember && (
                    <span className="inline-flex items-center rounded-full bg-[var(--primary)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--primary)]">
                      {isLeader ? "리더" : "멤버"}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-[var(--ui-text-muted)]">{study.description}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                {!isAdmin && !isMember && (
                  <Button variant="primary" onClick={() => setJoinOpen(true)}>
                    참여하기
                  </Button>
                )}
                {!isAdmin && isMember && (
                  <Button
                    variant="danger"
                    onClick={() => setLeaveOpen(true)}
                    className="px-3 py-1.5 text-sm"
                  >
                    탈퇴
                  </Button>
                )}
                {isAdmin && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setEditOpen(true)}
                      className="px-3 py-1.5 text-sm"
                    >
                      수정
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => setDeleteOpen(true)}
                      className="px-3 py-1.5 text-sm"
                    >
                      삭제
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {isAdmin && editOpen && (
            <div className="mt-4">
              <StudyForm
                defaultValues={{
                  name: study.name,
                  description: study.description,
                  level: study.level as StudyLevel,
                  type: study.type as StudyType,
                  githubOrgName: study.githubOrgName ?? "",
                  githubRepoName: study.githubRepoName ?? "",
                  githubWebhookSecret: "",
                }}
                onSubmit={(v) => updateMutation.mutate(v)}
                onCancel={() => setEditOpen(false)}
                isPending={updateMutation.isPending}
              />
            </div>
          )}

          {/* 커리큘럼 */}
          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-label text-[var(--ui-text-subtle)]">커리큘럼</h2>
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Button
                    variant="outline"
                    onClick={() => setCurriculumOpen(true)}
                    className="px-3 py-1.5 text-sm"
                  >
                    추가
                  </Button>
                )}
                <Link
                  href={`/studies/${id}/curriculums`}
                  className="text-sm font-medium text-[var(--primary)] hover:opacity-70 transition-opacity"
                >
                  전체 보기 →
                </Link>
              </div>
            </div>
            {curriculums.length > 0 ? (
              <ul className="space-y-2">
                {curriculums.slice(0, 5).map((c, idx) => (
                  <li key={c.id}>
                    <Link
                      href={`/studies/${id}/curriculums/${c.id}`}
                      className="ui-card flex items-center gap-3 p-4"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-sm font-bold text-[var(--primary)]">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-[var(--ui-text)]">{c.title}</span>
                        <span className="ml-2 text-sm text-[var(--ui-text-subtle)]">게시글 {c.postsCount}개</span>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--on-surface)]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="ui-card-static p-8 text-center">
                <svg className="mx-auto h-10 w-10 text-[var(--on-surface)]/20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-sm font-medium text-[var(--ui-text-muted)]">커리큘럼이 준비 중입니다.</p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--ui-text-subtle)]">학습 단계가 정리되면 여기에 표시됩니다.</p>
                {isAdmin && (
                  <Button
                    variant="primary"
                    onClick={() => setCurriculumOpen(true)}
                    className="mt-4 px-4 py-2 text-sm"
                  >
                    커리큘럼 추가하기
                  </Button>
                )}
              </div>
            )}
          </section>

          {/* 과제 */}
          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-label text-[var(--ui-text-subtle)]">과제</h2>
              <div className="flex items-center gap-3">
                {isMember && (
                  <Link
                    href={`/studies/${id}/progress`}
                    className="text-sm text-[var(--on-surface)]/50 hover:text-[var(--on-surface)] transition-colors"
                  >
                    내 진행현황
                  </Link>
                )}
                <Link
                  href={`/studies/${id}/assignments`}
                  className="text-sm font-medium text-[var(--primary)] hover:opacity-70 transition-opacity"
                >
                  전체 보기 →
                </Link>
              </div>
            </div>
            {assignments.length > 0 ? (
              <ul className="space-y-2">
                {assignments.slice(0, 3).map((a) => (
                  <li key={a.assignmentId}>
                    <Link
                      href={`/studies/${id}/assignments/${a.assignmentId}`}
                      className="ui-card flex items-center gap-3 p-4"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface-container-high)] text-xs font-bold text-[var(--on-surface)]/60">
                        {a.orderInStudy}
                      </span>
                      <span className="flex-1 min-w-0 font-medium text-[var(--on-surface)]">{a.title}</span>
                      {isMember && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          a.myStatus === "COMPLETED" ? "bg-green-100 text-green-700"
                          : a.myStatus === "APPLIED" ? "bg-yellow-100 text-yellow-700"
                          : "bg-[var(--surface-container-high)] text-[var(--on-surface)]/50"
                        }`}>
                          {a.myStatus === "COMPLETED" ? "완료" : a.myStatus === "APPLIED" ? "진행 중" : "미시작"}
                        </span>
                      )}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--on-surface)]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="ui-card-static p-8 text-center">
                <svg className="mx-auto h-10 w-10 text-[var(--on-surface)]/20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p className="text-sm font-medium text-[var(--ui-text-muted)]">등록된 과제가 없습니다.</p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--ui-text-subtle)]">과제가 등록되면 진행 현황을 확인할 수 있습니다.</p>
                {isAdmin && (
                  <Link
                    href={`/studies/${id}/assignments/new`}
                    className="ui-btn ui-btn-primary mt-4 px-4 py-2 text-sm"
                  >
                    과제 추가하기
                  </Link>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Slim metadata sidebar — Members */}
        <aside className="mt-8 lg:mt-0 lg:sticky lg:top-20">
          <h2 className="text-label text-[var(--ui-text-subtle)] mb-4">스터디원 ({members.length}명)</h2>
          {members.length > 0 ? (
            <ul className="space-y-2">
              {members.map((m) => (
                <li
                  key={m.memberId}
                  className="ui-card-static flex items-center gap-3 p-4"
                >
                  <UserAvatar name={m.nickname} profileImageUrl={m.profileImageUrl} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[var(--on-surface)]">{m.name}</p>
                    <a
                      href={`https://github.com/${m.githubUsername}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-sm text-[var(--on-surface)]/50 hover:text-[var(--primary)] transition-colors min-w-0"
                    >
                      <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                      <span className="truncate">@{m.githubUsername}</span>
                    </a>
                    {m.githubRepoName && (
                      study.githubOrgName ? (
                        <a
                          href={`https://github.com/${study.githubOrgName}/${m.githubRepoName}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-label text-[var(--primary)]/70 hover:text-[var(--primary)] transition-colors min-w-0"
                        >
                          <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                          <span className="truncate">{m.githubRepoName}</span>
                        </a>
                      ) : (
                        <p className="truncate text-label text-[var(--on-surface)]/40">{m.githubRepoName}</p>
                      )
                    )}
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${m.role === "LEADER" ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "bg-[var(--surface-container-high)] text-[var(--on-surface)]/60"}`}>
                    {m.role === "LEADER" ? "리더" : "멤버"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="ui-card-static p-6 text-center">
              <p className="text-[var(--ui-text-muted)]">스터디원이 없습니다.</p>
            </div>
          )}
        </aside>
      </div>

      {deleteOpen && (
        <ConfirmModal
          message="이 스터디를 삭제하시겠습니까? 하위 커리큘럼도 영향을 받을 수 있습니다."
          onConfirm={() => deleteMutation.mutate()}
          onCancel={() => setDeleteOpen(false)}
          isPending={deleteMutation.isPending}
        />
      )}

      {leaveOpen && (
        <ConfirmModal
          message="스터디를 탈퇴하시겠습니까? 과제 진행 기록도 함께 삭제됩니다."
          onConfirm={() => leaveMutation.mutate()}
          onCancel={() => setLeaveOpen(false)}
          isPending={leaveMutation.isPending}
        />
      )}

      {curriculumOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setCurriculumOpen(false)}
        >
          <div
            className="z-50 w-full max-w-lg rounded-2xl bg-[var(--surface-container-lowest)] p-6 shadow-ambient"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-[var(--on-surface)]">커리큘럼 추가</h3>
            <CurriculumForm
              onSubmit={(v) => createCurriculumMutation.mutate(v)}
              onCancel={() => setCurriculumOpen(false)}
              isPending={createCurriculumMutation.isPending}
            />
          </div>
        </div>
      )}

      {joinOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setJoinOpen(false)}
        >
          <div
            className="z-50 w-full max-w-sm rounded-2xl bg-[var(--surface-container-lowest)] p-6 shadow-ambient"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-[var(--on-surface)]">스터디 참여</h3>
            <p className="mt-1 text-sm text-[var(--on-surface)]/60">
              조직에 생성될 GitHub 레포지토리명을 입력하세요.
            </p>
            <form
              onSubmit={joinForm.handleSubmit((v) => joinMutation.mutate(v))}
              className="mt-4 flex flex-col gap-3"
            >
              <div>
                <label htmlFor="github-repo-name" className="block text-sm font-medium text-[var(--on-surface)]/70">
                  레포지토리명
                </label>
                <input
                  id="github-repo-name"
                  {...joinForm.register("githubRepoName")}
                  placeholder="my-study-repo"
                  className="mt-1 block w-full rounded-lg bg-[var(--surface-container-lowest)] px-3 py-2.5 text-sm text-[var(--on-surface)] placeholder:text-[var(--on-surface)]/35 border-ghost border-ghost-focus outline-none transition-all"
                />
                {joinForm.formState.errors.githubRepoName && (
                  <p className="mt-1 text-xs text-red-600">
                    {joinForm.formState.errors.githubRepoName.message}
                  </p>
                )}
                <p className="mt-1 text-label text-[var(--on-surface)]/40">
                  GitHub 조직({study.githubOrgName ?? "조직"})에 Public 레포가 자동 생성됩니다.
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setJoinOpen(false)}
                  className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-[var(--primary)] hover:bg-[var(--surface-container-low)] transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={joinMutation.isPending}
                  className="inline-flex items-center rounded-[1.5rem] bg-gradient-primary px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {joinMutation.isPending ? "처리 중..." : "참여하기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
