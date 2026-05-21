"use client";

import { apiClient, unwrapData } from "./client";
import type { ApiResponse } from "@/lib/types/api";
import type {
  AssignmentRequest,
  AssignmentResponse,
  AssignmentListItemResponse,
  ApplyAssignmentResponse,
  AssignmentProgressResponse,
} from "@/lib/types/assignment";

export async function createAssignment(
  studyId: number,
  body: AssignmentRequest
): Promise<AssignmentResponse | null> {
  const res = await apiClient.post<ApiResponse<AssignmentResponse>>(
    `/studies/${studyId}/assignments`,
    body
  );
  return unwrapData(res);
}

export async function getAssignments(
  studyId: number
): Promise<AssignmentListItemResponse[]> {
  const res = await apiClient.get<ApiResponse<AssignmentListItemResponse[]>>(
    `/studies/${studyId}/assignments`
  );
  return unwrapData(res) ?? [];
}

export async function getAssignment(
  assignmentId: number
): Promise<AssignmentResponse | null> {
  const res = await apiClient.get<ApiResponse<AssignmentResponse>>(
    `/assignments/${assignmentId}`
  );
  return unwrapData(res);
}

export async function updateAssignment(
  assignmentId: number,
  body: AssignmentRequest
): Promise<AssignmentResponse | null> {
  const res = await apiClient.put<ApiResponse<AssignmentResponse>>(
    `/assignments/${assignmentId}`,
    body
  );
  return unwrapData(res);
}

export async function deleteAssignment(assignmentId: number): Promise<void> {
  await apiClient.delete(`/assignments/${assignmentId}`);
}

export async function applyAssignment(
  assignmentId: number
): Promise<ApplyAssignmentResponse | null> {
  const res = await apiClient.post<ApiResponse<ApplyAssignmentResponse>>(
    `/assignments/${assignmentId}/apply`
  );
  return unwrapData(res);
}

export async function getMyProgress(
  studyId: number
): Promise<AssignmentProgressResponse[]> {
  const res = await apiClient.get<ApiResponse<AssignmentProgressResponse[]>>(
    `/studies/${studyId}/progress/me`
  );
  return unwrapData(res) ?? [];
}
