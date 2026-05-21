"use client";

import { apiClient, unwrapData } from "./client";
import type { ApiResponse } from "@/lib/types/api";
import type { LoginRequest, MemberInfo } from "@/lib/types/auth";
import { API_V1_BASE } from "@/lib/env";

export function getGithubLoginUrl(): string {
  return `${API_V1_BASE}/auth/github`;
}

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

export async function requestPasswordReset(email: string): Promise<void> {
  await apiClient.post("/auth/password-reset/request", { email });
}

export async function confirmPasswordReset(
  token: string,
  newPassword: string
): Promise<void> {
  await apiClient.post("/auth/password-reset/confirm", { token, newPassword });
}
