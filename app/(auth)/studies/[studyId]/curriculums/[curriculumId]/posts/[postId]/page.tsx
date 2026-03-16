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

const inputCls =
  "mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors";

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
        <button type="button" onClick={() => setOpen((b) => !b)} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
          {open ? "대댓글 숨기기" : `대댓글 ${comment.reCommentCount}개 보기`}
        </button>
      )}
      {open && (
        <div className="mt-2 space-y-2">
          {recomments.map((rc: ReCommentResponse) => (
            <div key={rc.reCommentId} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              {editingId === rc.reCommentId ? (
                <div className="flex gap-2">
                  <input value={editText} onChange={(e) => setEditText(e.target.value)} className={inputCls} />
                  <button type="button" onClick={() => updateMutation.mutate({ id: rc.reCommentId, content: editText })} disabled={updateMutation.isPending} className="rounded-lg bg-indigo-600 px-3 py-1 text-xs text-white disabled:opacity-50 whitespace-nowrap">저장</button>
                  <button type="button" onClick={() => setEditingId(null)} className="text-xs text-gray-500 hover:text-gray-700 whitespace-nowrap">취소</button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-medium text-gray-700">{rc.authorName}</span>
                    <p className="mt-1 text-sm text-gray-800">{rc.content}</p>
                    <span className="text-xs text-gray-400">{new Date(rc.createdAt).toLocaleString("ko-KR")}</span>
                  </div>
                  {user?.id === rc.authorId && (
                    <div className="flex shrink-0 gap-1">
                      <button type="button" onClick={() => { setEditingId(rc.reCommentId); setEditText(rc.content); }} className="text-xs text-gray-500 hover:text-gray-700">수정</button>
                      <button type="button" onClick={() => deleteMutation.mutate(rc.reCommentId)} className="text-xs text-red-500 hover:text-red-700">삭제</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {recommentsPage && !recommentsPage.last && (
            <button type="button" onClick={() => setPage((p) => p + 1)} className="text-xs text-gray-500 hover:text-gray-700">더 보기</button>
          )}
        </div>
      )}
      {user && (
        <div className="mt-2 flex gap-2">
          <input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="대댓글 입력..." className={inputCls} />
          <button type="button" onClick={() => { if (replyText.trim()) createMutation.mutate(replyText.trim()); }} disabled={createMutation.isPending || !replyText.trim()} className="rounded-lg bg-indigo-600 px-3 py-1 text-xs text-white disabled:opacity-50 whitespace-nowrap">작성</button>
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
    <section className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="text-lg font-semibold text-gray-900">댓글 {commentsPage?.totalElements ?? 0}개</h2>
      {user && (
        <div className="mt-4 flex gap-2">
          <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="댓글을 입력하세요..." className={inputCls} />
          <button type="button" onClick={() => { if (commentText.trim()) createMutation.mutate(commentText.trim()); }} disabled={createMutation.isPending || !commentText.trim()} className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 whitespace-nowrap">작성</button>
        </div>
      )}
      {isPending ? (
        <div className="mt-6 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" role="status" aria-label="로딩 중" />
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {comments.map((c: CommentResponse) => (
            <li key={c.commentId} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              {editingId === c.commentId ? (
                <div className="flex gap-2">
                  <input value={editText} onChange={(e) => setEditText(e.target.value)} className={inputCls} />
                  <button type="button" onClick={() => updateMutation.mutate({ id: c.commentId, content: editText })} disabled={updateMutation.isPending} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white disabled:opacity-50 whitespace-nowrap">저장</button>
                  <button type="button" onClick={() => setEditingId(null)} className="text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap">취소</button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">{c.authorName}</span>
                    <p className="mt-1 text-sm text-gray-800">{c.content}</p>
                    <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString("ko-KR")}</span>
                  </div>
                  {user?.id === c.authorId && (
                    <div className="flex shrink-0 gap-2">
                      <button type="button" onClick={() => { setEditingId(c.commentId); setEditText(c.content); }} className="text-xs text-gray-500 hover:text-gray-700">수정</button>
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
      {commentsPage && !commentsPage.last && (
        <button type="button" onClick={() => setPage((p) => p + 1)} className="mt-4 text-sm text-gray-500 hover:text-gray-700">댓글 더 보기</button>
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
        <p className="text-gray-500">게시글을 찾을 수 없습니다.</p>
        <button type="button" onClick={() => router.back()} className="mt-4 inline-block text-sm text-indigo-600 hover:underline">돌아가기</button>
      </div>
    );
  }

  if (isPending || !post) return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" role="status" aria-label="로딩 중" />
    </div>
  );

  return (
    <div className="flex gap-0">
      {/* Sidebar — course content */}
      <aside className="sticky top-[3.5rem] h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-gray-200 bg-white">
        <div className="p-4">
          <Link
            href={`/studies/${sId}/curriculums/${cId}`}
            className="mb-4 flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            ← 커리큘럼으로
          </Link>
          {curriculum && (
            <>
              <p className="text-sm font-semibold leading-snug text-gray-900">{curriculum.title}</p>
              {curriculum.description && (
                <p className="mt-1 text-xs leading-snug text-gray-500">{curriculum.description}</p>
              )}
              <div className="mt-3 border-t border-gray-100" />
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
                        ? "bg-indigo-600 text-white"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <span className={`mt-0.5 shrink-0 text-xs opacity-60 ${p.postId === id ? "text-indigo-200" : ""}`}>
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
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
              <p className="mt-2 text-sm text-gray-500">{post.authorName}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {/* Quiz button — visible to all */}
              <Link
                href={`/studies/${sId}/curriculums/${cId}/posts/${id}/quiz`}
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                퀴즈 풀기
              </Link>
              {isAdmin && (
                <>
                  <button
                    type="button"
                    onClick={handleGenerateQuiz}
                    disabled={isGeneratingQuiz}
                    className="inline-flex items-center rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
                  >
                    {isGeneratingQuiz ? "생성 중..." : "AI 퀴즈 생성"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditOpen((b) => !b)}
                    className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {editOpen ? "취소" : "수정"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteOpen(true)}
                    className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          </div>

          {isAdmin && editOpen && (
            <div className="mt-4">
              <PostEditForm postId={id} onSubmit={(v) => postUpdateMutation.mutate(v)} onCancel={() => setEditOpen(false)} isPending={postUpdateMutation.isPending} />
            </div>
          )}

          {!editOpen && (
            <div className="mt-6">
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
