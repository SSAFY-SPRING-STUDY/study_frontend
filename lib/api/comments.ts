"use client";

import { apiClient, unwrapData } from "./client";
import type { Page, ApiResponse } from "@/lib/types/api";
import type {
  CommentRequest,
  CommentResponse,
  ReCommentResponse,
} from "@/lib/types/comment";

export async function createComment(
  postId: number,
  body: CommentRequest
): Promise<void> {
  await apiClient.post<ApiResponse<void>>(`/posts/${postId}/comments`, body);
}

export async function getComments(
  postId: number,
  params?: { page?: number; size?: number }
): Promise<Page<CommentResponse>> {
  const { page = 0, size = 10 } = params ?? {};
  const res = await apiClient.get<ApiResponse<Page<CommentResponse>>>(
    `/posts/${postId}/comments`,
    { params: { page, size } }
  );
  const data = unwrapData(res);
  if (!data)
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 10,
      first: true,
      last: true,
      empty: true,
    };
  return data;
}

export async function updateComment(
  commentId: number,
  body: CommentRequest
): Promise<CommentResponse | null> {
  const res = await apiClient.patch<ApiResponse<CommentResponse>>(
    `/comments/${commentId}`,
    body
  );
  return unwrapData(res);
}

export async function deleteComment(commentId: number): Promise<void> {
  await apiClient.delete(`/comments/${commentId}`);
}

export async function createReComment(
  commentId: number,
  body: CommentRequest
): Promise<void> {
  await apiClient.post<ApiResponse<void>>(
    `/comments/${commentId}/recomments`,
    body
  );
}

export async function getReComments(
  commentId: number,
  params?: { page?: number; size?: number }
): Promise<Page<ReCommentResponse>> {
  const { page = 0, size = 10 } = params ?? {};
  const res = await apiClient.get<ApiResponse<Page<ReCommentResponse>>>(
    `/comments/${commentId}/recomments`,
    { params: { page, size } }
  );
  const data = unwrapData(res);
  if (!data)
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 10,
      first: true,
      last: true,
      empty: true,
    };
  return data;
}

export async function updateReComment(
  reCommentId: number,
  body: CommentRequest
): Promise<ReCommentResponse | null> {
  const res = await apiClient.patch<ApiResponse<ReCommentResponse>>(
    `/recomments/${reCommentId}`,
    body
  );
  return unwrapData(res);
}

export async function deleteReComment(reCommentId: number): Promise<void> {
  await apiClient.delete(`/recomments/${reCommentId}`);
}
