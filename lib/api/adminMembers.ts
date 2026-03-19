"use client";

import { apiClient, unwrapData } from "./client";
import type { ApiResponse } from "@/lib/types/api";
import type {
  AdminMemberResponse,
  AdminMemberPage,
  AdminMemberUpdateRequest,
} from "@/lib/types/member";

export async function getAdminMembers(params?: {
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string;
}): Promise<AdminMemberPage | null> {
  const res = await apiClient.get<ApiResponse<AdminMemberPage>>(
    "/admin/members",
    { params }
  );
  return unwrapData(res);
}

export async function getAdminMember(
  memberId: number
): Promise<AdminMemberResponse | null> {
  const res = await apiClient.get<ApiResponse<AdminMemberResponse>>(
    `/admin/members/${memberId}`
  );
  return unwrapData(res);
}

export async function updateAdminMember(
  memberId: number,
  body: AdminMemberUpdateRequest
): Promise<AdminMemberResponse | null> {
  const res = await apiClient.patch<ApiResponse<AdminMemberResponse>>(
    `/admin/members/${memberId}`,
    body
  );
  return unwrapData(res);
}
