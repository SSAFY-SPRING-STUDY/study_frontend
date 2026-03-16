"use client";
import { apiClient, unwrapData } from "./client";
import type { ApiResponse } from "@/lib/types/api";
import type { QuizResponse, QuizAttemptResponse, QuizSubmitRequest, QuizAttemptSummary } from "@/lib/types/quiz";
import type { Page } from "@/lib/types/api";

export async function getQuiz(postId: number): Promise<QuizResponse | null> {
  const res = await apiClient.get<ApiResponse<QuizResponse>>(`/posts/${postId}/quiz`);
  return unwrapData(res);
}

export async function submitQuiz(postId: number, body: QuizSubmitRequest): Promise<QuizAttemptResponse | null> {
  const res = await apiClient.post<ApiResponse<QuizAttemptResponse>>(`/posts/${postId}/quiz/submit`, body);
  return unwrapData(res);
}

export async function getMyQuizAttempt(postId: number): Promise<QuizAttemptResponse | null> {
  try {
    const res = await apiClient.get<ApiResponse<QuizAttemptResponse>>(`/posts/${postId}/quiz/attempts/me`);
    return unwrapData(res);
  } catch (err: unknown) {
    const axiosErr = err as { response?: { status?: number } };
    if (axiosErr?.response?.status === 404) return null;
    throw err;
  }
}

export async function generateQuiz(postId: number): Promise<void> {
  await apiClient.post(`/posts/${postId}/quiz/generate`);
}

export async function getQuizAttempts(
  postId: number,
  params?: { page?: number; size?: number }
): Promise<Page<QuizAttemptSummary>> {
  const { page = 0, size = 20 } = params ?? {};
  const res = await apiClient.get<ApiResponse<Page<QuizAttemptSummary>>>(
    `/posts/${postId}/quiz/attempts`,
    { params: { page, size } }
  );
  const data = unwrapData(res);
  if (!data)
    return { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, first: true, last: true, empty: true };
  return data;
}
