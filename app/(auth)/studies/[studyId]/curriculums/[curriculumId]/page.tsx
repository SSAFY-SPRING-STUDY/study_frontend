"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurriculum } from "@/lib/api/curriculums";
import { getPostsByCurriculum, createPost, updatePost, deletePost } from "@/lib/api/posts";
import { getStudy } from "@/lib/api/studies";
import { useIsAdmin } from "@/store/auth-store";
import { PostForm, PostEditForm } from "@/components/forms/PostForm";
import type { PostRequest } from "@/lib/types/post";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/lib/toast";

export default function CurriculumDetailPage({
  params,
}: {
  params: Promise<{ studyId: string; curriculumId: string }>;
}) {
  const { studyId, curriculumId } = use(params);
  const sId = Number(studyId);
  const cId = Number(curriculumId);
  const isAdmin = useIsAdmin();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);

  const { data: study } = useQuery({
    queryKey: ["studies", sId],
    queryFn: () => getStudy(sId),
    enabled: !Number.isNaN(sId),
  });

  const { data: curriculum, isPending, isError } = useQuery({
    queryKey: ["curriculums", cId],
    queryFn: () => getCurriculum(cId),
    enabled: !Number.isNaN(cId),
  });

  const { data: posts = [], isPending: postsPending } = useQuery({
    queryKey: ["curriculums", cId, "posts"],
    queryFn: () => getPostsByCurriculum(cId),
    enabled: !Number.isNaN(cId) && !!curriculum,
  });

  const createMutation = useMutation({
    mutationFn: (body: PostRequest) => createPost(cId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curriculums", cId, "posts"] });
      queryClient.invalidateQueries({ queryKey: ["curriculums", cId] });
      setCreateOpen(false);
      showToast("게시글이 생성되었습니다.", "success");
    },
    onError: () => showToast("게시글 생성에 실패했습니다.", "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: PostRequest }) => updatePost(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curriculums", cId, "posts"] });
      setEditingPostId(null);
      showToast("게시글이 수정되었습니다.", "success");
    },
    onError: () => showToast("게시글 수정에 실패했습니다.", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curriculums", cId, "posts"] });
      queryClient.invalidateQueries({ queryKey: ["curriculums", cId] });
      setDeletingPostId(null);
      showToast("게시글이 삭제되었습니다.", "success");
    },
    onError: () => showToast("게시글 삭제에 실패했습니다.", "error"),
  });

  if (Number.isNaN(cId) || isError || (!isPending && !curriculum)) {
    return (
      <div>
        <p className="text-gray-500">커리큘럼을 찾을 수 없습니다.</p>
        <Link href="/studies" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">스터디 목록</Link>
      </div>
    );
  }

  if (isPending || !curriculum) return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" role="status" aria-label="로딩 중" />
    </div>
  );

  return (
    <div>
      <nav className="flex items-center gap-1 text-sm text-gray-500">
        <Link href="/studies" className="hover:text-gray-900 transition-colors">스터디</Link>
        <span>/</span>
        <Link href={`/studies/${sId}`} className="hover:text-gray-900 transition-colors">{study?.name ?? "상세"}</Link>
        <span>/</span>
        <Link href={`/studies/${sId}/curriculums`} className="hover:text-gray-900 transition-colors">커리큘럼</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{curriculum.title}</span>
      </nav>

      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">{curriculum.title}</h1>
        {curriculum.description && (
          <p className="mt-2 text-gray-600">{curriculum.description}</p>
        )}
        <p className="mt-2 text-sm text-gray-400">게시글 {curriculum.postsCount}개</p>
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">게시글 목록</h2>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              게시글 추가
            </button>
          )}
        </div>

        {isAdmin && createOpen && (
          <div className="mt-4">
            <PostForm
              onSubmit={(v) => createMutation.mutate(v)}
              onCancel={() => setCreateOpen(false)}
              isPending={createMutation.isPending}
            />
          </div>
        )}

        {isAdmin && editingPostId != null && (
          <div className="mt-4">
            <PostEditForm
              postId={editingPostId}
              onSubmit={(v) => updateMutation.mutate({ id: editingPostId, body: v })}
              onCancel={() => setEditingPostId(null)}
              isPending={updateMutation.isPending}
            />
          </div>
        )}

        {postsPending ? (
          <div className="mt-4 flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" role="status" aria-label="로딩 중" />
          </div>
        ) : posts.length === 0 ? (
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 text-center">
            <p className="text-gray-500">등록된 게시글이 없습니다.</p>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {posts.map((post) => (
              <li key={post.postId} className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between p-4">
                  <Link
                    href={`/studies/${sId}/curriculums/${cId}/posts/${post.postId}`}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                      {post.orderInCurriculum}
                    </span>
                    <div className="min-w-0">
                      <span className="font-medium text-gray-900">{post.title}</span>
                      <span className="ml-2 text-sm text-gray-400">{post.authorName}</span>
                    </div>
                  </Link>
                  {isAdmin && (
                    <div className="ml-4 flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingPostId(post.postId)}
                        className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingPostId(post.postId)}
                        className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link
        href={`/studies/${sId}/curriculums`}
        className="mt-6 inline-block text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        ← 커리큘럼 목록
      </Link>

      {deletingPostId != null && (
        <ConfirmModal
          message="이 게시글을 삭제하시겠습니까?"
          onConfirm={() => deleteMutation.mutate(deletingPostId)}
          onCancel={() => setDeletingPostId(null)}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
