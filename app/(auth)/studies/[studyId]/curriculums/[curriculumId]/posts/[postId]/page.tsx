"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPost, updatePost, deletePost } from "@/lib/api/posts";
import { getCurriculum } from "@/lib/api/curriculums";
import { getPostsByCurriculum } from "@/lib/api/posts";
import {
  getComments, createComment, updateComment, deleteComment,
  getReComments, createReComment, updateReComment, deleteReComment,
} from "@/lib/api/comments";
import { generateQuiz } from "@/lib/api/quiz";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { useAuthStore, useIsAdmin } from "@/store/auth-store";
import { useToast } from "@/lib/toast";
import { PostEditForm } from "@/components/forms/PostForm";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type { CommentResponse, ReCommentResponse } from "@/lib/types/comment";
import { Button } from "@/components/ui/Button";

const inputCls = "ui-field";

function ReCommentSection({ comment }: { comment: CommentResponse }) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [page, setPage] = useState(0);

  const { data: recommentsPage } = useQuery({
    queryKey: ["comments", comment.commentId, "recomments", page],
    queryFn: () => getReComments(comment.commentId, { page }),
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: (content: string) => createReComment(comment.commentId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", comment.commentId, "recomments"] });
      queryClient.invalidateQueries({ queryKey: ["posts", comment.postId, "comments"] });
      setReplyText("");
      showToast("대댓글이 작성되었습니다.", "success");
    },
    onError: () => showToast("대댓글 작성에 실패했습니다.", "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) => updateReComment(id, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", comment.commentId, "recomments"] });
      setEditingId(null);
      showToast("대댓글이 수정되었습니다.", "success");
    },
    onError: () => showToast("대댓글 수정에 실패했습니다.", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", comment.commentId, "recomments"] });
      queryClient.invalidateQueries({ queryKey: ["posts", comment.postId, "comments"] });
      showToast("대댓글이 삭제되었습니다.", "success");
    },
    onError: () => showToast("대댓글 삭제에 실패했습니다.", "error"),
  });

  const recomments = recommentsPage?.content ?? [];

  return (
    <div className="ml-8 mt-3">
      {comment.reCommentCount > 0 && (
        <button type="button" onClick={() => setOpen((b) => !b)} className="text-xs font-medium text-[var(--primary)] hover:opacity-80 transition-opacity">
          {open ? "대댓글 숨기기" : `대댓글 ${comment.reCommentCount}개 보기`}
        </button>
      )}
      {open && (
        <div className="mt-2 space-y-2">
          {recomments.map((rc: ReCommentResponse) => (
            <div key={rc.reCommentId} className="rounded-lg bg-[var(--surface-container-low)] p-3">
              {editingId === rc.reCommentId ? (
                <div className="flex gap-2">
                  <input value={editText} onChange={(e) => setEditText(e.target.value)} className={inputCls} />
                  <button type="button" onClick={() => updateMutation.mutate({ id: rc.reCommentId, content: editText })} disabled={updateMutation.isPending} className="rounded-[1.5rem] bg-gradient-primary px-3 py-1 text-xs text-white disabled:opacity-50 whitespace-nowrap">저장</button>
                  <button type="button" onClick={() => setEditingId(null)} className="text-xs text-[var(--on-surface)]/50 hover:text-[var(--on-surface)] whitespace-nowrap">취소</button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-medium text-[var(--on-surface)]/70">{rc.authorName}</span>
                    <p className="mt-1 text-sm text-[var(--on-surface)]/80">{rc.content}</p>
                    <span className="text-label text-[var(--on-surface)]/40">{new Date(rc.createdAt).toLocaleString("ko-KR")}</span>
                  </div>
                  {user?.id === rc.authorId && (
                    <div className="flex shrink-0 gap-1">
                      <button type="button" onClick={() => { setEditingId(rc.reCommentId); setEditText(rc.content); }} className="text-xs text-[var(--on-surface)]/50 hover:text-[var(--on-surface)]">수정</button>
                      <button type="button" onClick={() => deleteMutation.mutate(rc.reCommentId)} className="text-xs text-red-500 hover:text-red-700">삭제</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {recommentsPage && recommentsPage.page.number + 1 < recommentsPage.page.totalPages && (
            <button type="button" onClick={() => setPage((p) => p + 1)} className="text-xs text-[var(--on-surface)]/50 hover:text-[var(--on-surface)]">더 보기</button>
          )}
        </div>
      )}
      {user && (
        <div className="mt-2 flex gap-2">
          <input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="대댓글 입력..." className={inputCls} />
          <button type="button" onClick={() => { if (replyText.trim()) createMutation.mutate(replyText.trim()); }} disabled={createMutation.isPending || !replyText.trim()} className="rounded-[1.5rem] bg-gradient-primary px-3 py-1 text-xs text-white disabled:opacity-50 whitespace-nowrap">작성</button>
        </div>
      )}
    </div>
  );
}

function CommentSection({ postId }: { postId: number }) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const user = useAuthStore((s) => s.user);
  const [commentText, setCommentText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [page, setPage] = useState(0);

  const { data: commentsPage, isPending } = useQuery({
    queryKey: ["posts", postId, "comments", page],
    queryFn: () => getComments(postId, { page }),
    enabled: !Number.isNaN(postId),
  });

  const createMutation = useMutation({
    mutationFn: (content: string) => createComment(postId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", postId, "comments"] });
      setCommentText("");
      showToast("댓글이 작성되었습니다.", "success");
    },
    onError: () => showToast("댓글 작성에 실패했습니다.", "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) => updateComment(id, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", postId, "comments"] });
      setEditingId(null);
      showToast("댓글이 수정되었습니다.", "success");
    },
    onError: () => showToast("댓글 수정에 실패했습니다.", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", postId, "comments"] });
      showToast("댓글이 삭제되었습니다.", "success");
    },
    onError: () => showToast("댓글 삭제에 실패했습니다.", "error"),
  });

  const comments = commentsPage?.content ?? [];

  return (
    <section className="mt-12 pt-8">
      <div className="h-px bg-[var(--surface-container-high)] mb-8" />
      <h2 className="text-label text-[var(--ui-text-subtle)]">댓글 {commentsPage?.page.totalElements ?? 0}개</h2>
      {user ? (
        <div className="mt-4 flex gap-2">
          <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="댓글을 입력하세요..." className={inputCls} />
          <Button
            type="button"
            variant="primary"
            onClick={() => { if (commentText.trim()) createMutation.mutate(commentText.trim()); }}
            disabled={createMutation.isPending || !commentText.trim()}
            className="px-4 py-2 text-sm whitespace-nowrap"
          >
            작성
          </Button>
        </div>
      ) : (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-dashed border-[var(--ui-card-border-strong)]/50 bg-[var(--surface-container-low)] px-4 py-3">
          <p className="text-sm text-[var(--on-surface)]/65">
            댓글을 작성하려면 로그인이 필요합니다.
          </p>
          <Link
            href={`/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "")}`}
            className="shrink-0 rounded-[1.5rem] bg-gradient-primary px-4 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
          >
            로그인
          </Link>
        </div>
      )}
      {isPending ? (
        <div className="mt-6 flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--surface-container-high)] border-t-[var(--primary)]" role="status" aria-label="로딩 중" />
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {comments.map((c: CommentResponse) => (
            <li key={c.commentId} className="ui-card-static p-4">
              {editingId === c.commentId ? (
                <div className="flex gap-2">
                  <input value={editText} onChange={(e) => setEditText(e.target.value)} className={inputCls} />
                  <button type="button" onClick={() => updateMutation.mutate({ id: c.commentId, content: editText })} disabled={updateMutation.isPending} className="rounded-[1.5rem] bg-gradient-primary px-3 py-1.5 text-sm text-white disabled:opacity-50 whitespace-nowrap">저장</button>
                  <button type="button" onClick={() => setEditingId(null)} className="text-sm text-[var(--on-surface)]/50 hover:text-[var(--on-surface)] whitespace-nowrap">취소</button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-medium text-[var(--on-surface)]/70">{c.authorName}</span>
                    <p className="mt-1 text-sm text-[var(--on-surface)]/80">{c.content}</p>
                    <span className="text-label text-[var(--on-surface)]/40">{new Date(c.createdAt).toLocaleString("ko-KR")}</span>
                  </div>
                  {user?.id === c.authorId && (
                    <div className="flex shrink-0 gap-2">
                      <button type="button" onClick={() => { setEditingId(c.commentId); setEditText(c.content); }} className="text-xs text-[var(--on-surface)]/50 hover:text-[var(--on-surface)]">수정</button>
                      <button type="button" onClick={() => deleteMutation.mutate(c.commentId)} className="text-xs text-red-500 hover:text-red-700">삭제</button>
                    </div>
                  )}
                </div>
              )}
              <ReCommentSection comment={c} />
            </li>
          ))}
        </ul>
      )}
      {commentsPage && commentsPage.page.number + 1 < commentsPage.page.totalPages && (
        <button type="button" onClick={() => setPage((p) => p + 1)} className="mt-4 text-sm text-[var(--on-surface)]/50 hover:text-[var(--on-surface)]">댓글 더 보기</button>
      )}
    </section>
  );
}

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ studyId: string; curriculumId: string; postId: string }>;
}) {
  const { studyId, curriculumId, postId } = use(params);
  const sId = Number(studyId);
  const cId = Number(curriculumId);
  const id = Number(postId);
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const postUpdateMutation = useMutation({
    mutationFn: (body: Parameters<typeof updatePost>[1]) => updatePost(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", id] });
      setEditOpen(false);
      showToast("게시글이 수정되었습니다.", "success");
    },
    onError: () => showToast("게시글 수정에 실패했습니다.", "error"),
  });

  const postDeleteMutation = useMutation({
    mutationFn: () => deletePost(id),
    onSuccess: () => {
      showToast("게시글이 삭제되었습니다.", "success");
      router.replace(`/studies/${sId}/curriculums/${cId}`);
    },
    onError: () => showToast("게시글 삭제에 실패했습니다.", "error"),
  });

  const { data: post, isPending, isError } = useQuery({
    queryKey: ["posts", id],
    queryFn: () => getPost(id),
    enabled: !Number.isNaN(id),
  });

  const { data: curriculum } = useQuery({
    queryKey: ["curriculums", cId],
    queryFn: () => getCurriculum(cId),
    enabled: !Number.isNaN(cId),
  });

  const { data: siblingPosts = [] } = useQuery({
    queryKey: ["curriculums", cId, "posts"],
    queryFn: () => getPostsByCurriculum(cId),
    enabled: !Number.isNaN(cId),
  });

  async function handleGenerateQuiz() {
    setIsGeneratingQuiz(true);
    try {
      await generateQuiz(id);
      showToast("AI 퀴즈 생성을 요청했습니다.", "success");
    } catch {
      showToast("퀴즈 생성에 실패했습니다.", "error");
    } finally {
      setIsGeneratingQuiz(false);
    }
  }

  if (Number.isNaN(id) || isError || (!isPending && !post)) {
    return (
      <div>
        <p className="text-[var(--on-surface)]/50">게시글을 찾을 수 없습니다.</p>
        <button type="button" onClick={() => router.back()} className="mt-4 inline-block text-sm text-[var(--primary)] hover:underline">돌아가기</button>
      </div>
    );
  }

  if (isPending || !post) return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--surface-container-high)] border-t-[var(--primary)]" role="status" aria-label="로딩 중" />
    </div>
  );

  return (
    <div className="flex gap-0">
      {/* Sidebar — course content */}
      <aside className="sticky top-[3.5rem] h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto bg-[var(--surface-container-low)]">
        <div className="p-4">
          <Link
            href={`/studies/${sId}/curriculums/${cId}`}
            className="mb-4 flex items-center gap-1 text-xs font-medium text-[var(--primary)] hover:opacity-80 transition-opacity"
          >
            ← 커리큘럼으로
          </Link>
          {curriculum && (
            <>
              <p className="text-sm font-semibold leading-snug text-[var(--on-surface)]">{curriculum.title}</p>
              {curriculum.description && (
                <p className="mt-1 text-xs leading-snug text-[var(--on-surface)]/50">{curriculum.description}</p>
              )}
              <div className="mt-3 h-px bg-[var(--surface-container-high)]" />
            </>
          )}
          <nav className="mt-3" aria-label="게시글 목록">
            <ul className="space-y-0.5">
              {siblingPosts.map((p) => (
                <li key={p.postId}>
                  <Link
                    href={`/studies/${sId}/curriculums/${cId}/posts/${p.postId}`}
                    className={`flex items-start gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${
                      p.postId === id
                        ? "bg-gradient-primary text-white"
                        : "text-[var(--on-surface)]/60 hover:bg-[var(--surface-container-high)] hover:text-[var(--on-surface)]"
                    }`}
                  >
                    <span className="mt-0.5 shrink-0 text-xs opacity-60">
                      {p.orderInCurriculum}
                    </span>
                    <span className="leading-snug">{p.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1 px-8 py-6">
        <article className="max-w-3xl">
          <div className="ui-card-static p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="ui-title">{post.title}</h1>
                <p className="mt-2 text-label text-[var(--ui-text-subtle)]">{post.authorName}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <Link
                  href={`/studies/${sId}/curriculums/${cId}/posts/${id}/quiz`}
                  className="ui-btn ui-btn-primary px-4 py-2 text-sm"
                >
                  퀴즈 풀기
                </Link>
                {isAdmin && (
                  <>
                    <Button
                      type="button"
                      variant="surface"
                      onClick={handleGenerateQuiz}
                      disabled={isGeneratingQuiz}
                      className="px-3 py-2 text-sm"
                    >
                      {isGeneratingQuiz ? "생성 중..." : "AI 퀴즈 생성"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditOpen((b) => !b)}
                      className="px-3 py-2 text-sm"
                    >
                      {editOpen ? "취소" : "수정"}
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => setDeleteOpen(true)}
                      className="px-3 py-2 text-sm"
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
              <PostEditForm postId={id} onSubmit={(v) => postUpdateMutation.mutate(v)} onCancel={() => setEditOpen(false)} isPending={postUpdateMutation.isPending} />
            </div>
          )}

          {!editOpen && (
            <div className="ui-card-static mt-6 p-8">
              <MarkdownContent content={post.content} />
            </div>
          )}
          <CommentSection postId={id} />
        </article>

        {deleteOpen && (
          <ConfirmModal
            message="이 게시글을 삭제하시겠습니까?"
            onConfirm={() => postDeleteMutation.mutate()}
            onCancel={() => setDeleteOpen(false)}
            isPending={postDeleteMutation.isPending}
          />
        )}
      </main>
    </div>
  );
}
