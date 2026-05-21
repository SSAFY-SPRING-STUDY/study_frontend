"use client";

import { apiClient, unwrapData } from "./client";
import type { ApiResponse } from "@/lib/types/api";
import type {
  StudyMembersResponse,
  StudyMemberRoleUpdateRequest,
  JoinStudyRequest,
  UpdateGithubRepoRequest,
} from "@/lib/types/studyMember";

export async function joinStudy(studyId: number, body: JoinStudyRequest): Promise<void> {
  await apiClient.post(`/studies/${studyId}/members`, body);
}

export async function getStudyMembers(
  studyId: number
): Promise<StudyMembersResponse | null> {
  const res = await apiClient.get<ApiResponse<StudyMembersResponse>>(
    `/studies/${studyId}/members`
  );
  return unwrapData(res);
}

export async function updateStudyMemberRole(
  studyId: number,
  targetMemberId: number,
  body: StudyMemberRoleUpdateRequest
): Promise<void> {
  await apiClient.patch(
    `/studies/${studyId}/members/${targetMemberId}/role`,
    body
  );
}

export async function updateStudyMemberRepo(
  studyId: number,
  targetMemberId: number,
  body: UpdateGithubRepoRequest
): Promise<void> {
  await apiClient.patch(`/studies/${studyId}/members/${targetMemberId}/repo`, body);
}

export async function leaveStudy(studyId: number): Promise<void> {
  await apiClient.delete(`/studies/${studyId}/members/me`);
}
