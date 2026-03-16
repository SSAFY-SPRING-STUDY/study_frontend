"use client";

import { apiClient, unwrapData } from "./client";
import type { ApiResponse } from "@/lib/types/api";
import type {
  PostRequest,
  PostDetailResponse,
  PostSimpleResponse,
} from "@/lib/types/post";

/** 커리큘럼별 게시글 목록 (API 5.1) */
export async function getPostsByCurriculum(
    curriculumId: number
  ): Promise<PostSimpleResponse[]> {
    const res = await apiClient.get<ApiResponse<PostSimpleResponse[]>>(
      `/curriculums/${curriculumId}/posts`
    );
    return unwrapData(res) ?? [];
}

export async function getPost(
  id: number
): Promise<PostDetailResponse | null> {
  const res = await apiClient.get<ApiResponse<PostDetailResponse>>(
    `/posts/${id}`
  );
  return unwrapData(res);
}

export async function createPost(
  curriculumId: number,
  body: PostRequest
): Promise<PostSimpleResponse | null> {
  const res = await apiClient.post<ApiResponse<PostSimpleResponse>>(
    `/curriculums/${curriculumId}/posts`,
    body
  );
  return unwrapData(res);
}

export async function updatePost(
  id: number,
  body: PostRequest
): Promise<PostSimpleResponse | null> {
  const res = await apiClient.put<ApiResponse<PostSimpleResponse>>(
    `/posts/${id}`,
    body
  );
  return unwrapData(res);
}

export async function deletePost(id: number): Promise<void> {
  await apiClient.delete(`/posts/${id}`);
}
