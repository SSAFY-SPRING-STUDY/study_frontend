"use client";

import { apiClient, unwrapData } from "./client";
import type { ApiResponse } from "@/lib/types/api";
import type { MemberInfo } from "@/lib/types/auth";
import type {
  SignupRequest,
  MemberUpdateRequest,
  PasswordUpdateRequest,
} from "@/lib/types/member";

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
