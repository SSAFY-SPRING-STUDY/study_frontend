"use client";

import { apiClient, unwrapData } from "./client";
import type { ApiResponse } from "@/lib/types/api";
import type { ImageRequest, ImageResponse } from "@/lib/types/image";

export async function getPresignedUploadUrl(
  body: ImageRequest
): Promise<ImageResponse | null> {
  const res = await apiClient.post<ApiResponse<ImageResponse>>(
    `/images/presigned-url`,
    body
  );
  return unwrapData(res);
}

export async function completeImageUpload(imageId: number): Promise<void> {
  await apiClient.patch(`/images/${imageId}/complete`);
}

export async function getImage(id: number): Promise<ImageResponse | null> {
  const res = await apiClient.get<ApiResponse<ImageResponse>>(
    `/images/${id}`
  );
  return unwrapData(res);
}

export async function getPostImages(
  postId: number
): Promise<ImageResponse[] | null> {
  const res = await apiClient.get<ApiResponse<ImageResponse[]>>(
    `/posts/${postId}/images`
  );
  return unwrapData(res);
}
