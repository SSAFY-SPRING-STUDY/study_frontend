"use client";

import { apiClient, unwrapData } from "./client";
import type { ApiResponse } from "@/lib/types/api";
import type { Page } from "@/lib/types/api";
import type { StudyRequest, StudyResponse } from "@/lib/types/study";

export async function getStudies(params: {
  studyType: string;
  page?: number;
  size?: number;
}): Promise<Page<StudyResponse>> {
  const { studyType, page = 0, size = 10 } = params;
  const res = await apiClient.get<ApiResponse<Page<StudyResponse>>>(
    "/studies",
    { params: { studyType, page, size } }
  );
  const data = unwrapData(res);
  if (!data) throw new Error("No data");
  return data;
}

export async function getStudy(id: number): Promise<StudyResponse | null> {
  const res = await apiClient.get<ApiResponse<StudyResponse>>(
    `/studies/${id}`
  );
  return unwrapData(res);
}

export async function createStudy(
  body: StudyRequest
): Promise<StudyResponse | null> {
  const res = await apiClient.post<ApiResponse<StudyResponse>>(
    "/studies",
    body
  );
  return unwrapData(res);
}

export async function updateStudy(
  id: number,
  body: StudyRequest
): Promise<StudyResponse | null> {
  const res = await apiClient.put<ApiResponse<StudyResponse>>(
    `/studies/${id}`,
    body
  );
  return unwrapData(res);
}

export async function deleteStudy(id: number): Promise<void> {
  await apiClient.delete(`/studies/${id}`);
}
