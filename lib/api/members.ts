"use client";

import { apiClient, unwrapData } from "./client";
import type { ApiResponse } from "@/lib/types/api";
import type { MemberInfo } from "@/lib/types/auth";
import type {
  SignupRequest,
  MemberUpdateRequest,
  PasswordUpdateRequest,
  DescriptionUpdateRequest,
  ProfileImageUploadUrlRequest,
  ProfileImageUploadUrlResponse,
  ProfileImageUpdateRequest,
} from "@/lib/types/member";
import { API_V1_BASE } from "@/lib/env";

export function getGithubConnectUrl(): string {
  return `${API_V1_BASE}/members/me/github/connect`;
}

export async function signup(body: SignupRequest): Promise<void> {
  await apiClient.post("/members/signup", body);
}

export async function getMe(): Promise<MemberInfo | null> {
  const res = await apiClient.get<ApiResponse<MemberInfo>>("/members/me");
  return unwrapData(res);
}

export async function getMember(id: number): Promise<MemberInfo | null> {
  const res = await apiClient.get<ApiResponse<MemberInfo>>(`/members/${id}`);
  return unwrapData(res);
}

export async function updateMe(
  body: MemberUpdateRequest
): Promise<MemberInfo | null> {
  const res = await apiClient.patch<ApiResponse<MemberInfo>>(
    "/members/me",
    body
  );
  return unwrapData(res);
}

export async function updateMyPassword(
  body: PasswordUpdateRequest
): Promise<void> {
  await apiClient.patch("/members/me/password", body);
}

export async function updateMyDescription(
  body: DescriptionUpdateRequest
): Promise<MemberInfo | null> {
  const res = await apiClient.patch<ApiResponse<MemberInfo>>(
    "/members/me/profile/description",
    body
  );
  return unwrapData(res);
}

export async function getProfileImageUploadUrl(
  body: ProfileImageUploadUrlRequest
): Promise<ProfileImageUploadUrlResponse | null> {
  const res = await apiClient.post<ApiResponse<ProfileImageUploadUrlResponse>>(
    "/members/me/profile/image/presigned-url",
    body
  );
  return unwrapData(res);
}

export async function uploadImageToS3(
  presignedUrl: string,
  file: File
): Promise<void> {
  await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
      "Content-Length": String(file.size),
    },
    body: file,
  });
}

export async function updateMyProfileImage(
  body: ProfileImageUpdateRequest
): Promise<MemberInfo | null> {
  const res = await apiClient.patch<ApiResponse<MemberInfo>>(
    "/members/me/profile/image",
    body
  );
  return unwrapData(res);
}

export async function deleteMyProfileImage(): Promise<MemberInfo | null> {
  const res = await apiClient.delete<ApiResponse<MemberInfo>>(
    "/members/me/profile/image"
  );
  return unwrapData(res);
}
