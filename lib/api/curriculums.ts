"use client";

import { apiClient, unwrapData } from "./client";
import type { ApiResponse } from "@/lib/types/api";
import type { Page } from "@/lib/types/api";
import type {
  CurriculumRequest,
  CurriculumResponse,
} from "@/lib/types/curriculum";

/** 스터디별 커리큘럼 목록 (API 4.2: page, size, sort 지원) */
export async function getCurriculumsByStudy(
    studyId: number,
    params?: { page?: number; size?: number; sort?: string }
  ): Promise<CurriculumResponse[]> {
    try {
      const { page = 0, size = 100, sort = "orderInStudy,asc" } = params ?? {};
      const res = await apiClient.get<
        ApiResponse<Page<CurriculumResponse>>
      >(`/studies/${studyId}/curriculums`, {
        params: { page, size, sort },
      });
      const data = unwrapData(res);
      if (!data || !Array.isArray(data.content)) return [];
      return data.content;
    } catch {
      return [];
    }
  }
/** 스터디별 커리큘럼 목록 (Page 전체 반환, 페이지네이션 UI용) */
export async function getCurriculumsByStudyPage(
    studyId: number,
    params?: { page?: number; size?: number; sort?: string }
  ): Promise<Page<CurriculumResponse>> {
    const { page = 0, size = 10, sort = "orderInStudy,asc" } = params ?? {};
    const res = await apiClient.get<ApiResponse<Page<CurriculumResponse>>>(
      `/studies/${studyId}/curriculums`,
      { params: { page, size, sort } }
    );
    const data = unwrapData(res);
    if (!data)
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 10,
        first: true,
        last: true,
        empty: true,
      };
    return data;
}
  

export async function getCurriculum(
  id: number
): Promise<CurriculumResponse | null> {
  const res = await apiClient.get<ApiResponse<CurriculumResponse>>(
    `/curriculums/${id}`
  );
  return unwrapData(res);
}

export async function createCurriculum(
  studyId: number,
  body: CurriculumRequest
): Promise<CurriculumResponse | null> {
  const res = await apiClient.post<ApiResponse<CurriculumResponse>>(
    `/studies/${studyId}/curriculums`,
    body
  );
  return unwrapData(res);
}

export async function updateCurriculum(
  id: number,
  body: CurriculumRequest
): Promise<CurriculumResponse | null> {
  const res = await apiClient.put<ApiResponse<CurriculumResponse>>(
    `/curriculums/${id}`,
    body
  );
  return unwrapData(res);
}

export async function deleteCurriculum(id: number): Promise<void> {
  await apiClient.delete(`/curriculums/${id}`);
}
