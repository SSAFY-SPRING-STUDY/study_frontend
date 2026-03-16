"use client";

import { apiClient, unwrapData } from "./client";
import type { ApiResponse } from "@/lib/types/api";
import type { Page } from "@/lib/types/api";
import type {
  NoticeRequest,
  NoticeResponse,
} from "@/lib/types/notice";

export async function getNotices(params?: {
  page?: number;
  size?: number;
}): Promise<Page<NoticeResponse>> {
  const { page = 0, size = 10 } = params ?? {};
  const res = await apiClient.get<ApiResponse<Page<NoticeResponse>>>(
    "/notices",
    { params: { page, size } }
  );
  const data = unwrapData(res);
  if (!data) throw new Error("No data");
  return data;
}

export async function getNotice(id: number): Promise<NoticeResponse | null> {
  const res = await apiClient.get<ApiResponse<NoticeResponse>>(
    `/notices/${id}`
  );
  return unwrapData(res);
}

export async function createNotice(body: NoticeRequest): Promise<void> {
  await apiClient.post("/notices", body);
}

export async function updateNotice(
  id: number,
  body: NoticeRequest
): Promise<NoticeResponse | null> {
  const res = await apiClient.put<ApiResponse<NoticeResponse>>(
    `/notices/${id}`,
    body
  );
  return unwrapData(res);
}

export async function deleteNotice(id: number): Promise<void> {
  await apiClient.delete(`/notices/${id}`);
}
