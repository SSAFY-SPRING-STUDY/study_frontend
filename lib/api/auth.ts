"use client";

import { apiClient, unwrapData } from "./client";
import type { ApiResponse } from "@/lib/types/api";
import type { LoginRequest, MemberInfo } from "@/lib/types/auth";

export async function login(body: LoginRequest): Promise<MemberInfo | null> {
  const res = await apiClient.post<ApiResponse<MemberInfo>>("/auth/login", body);
  return unwrapData(res);
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function refreshToken(): Promise<void> {
  await apiClient.post("/auth/refresh");
}
