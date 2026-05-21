"use client";

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_V1_BASE } from "@/lib/env";
import type { ApiResponse } from "@/lib/types/api";
import { showToast } from "@/lib/toast";

export const apiClient = axios.create({
  baseURL: API_V1_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (v?: unknown) => void;
  reject: (e: unknown) => void;
}> = [];

function processQueue(error: Error | null) {
  failedQueue.forEach((prom) =>
    error ? prom.reject(error) : prom.resolve(undefined)
  );
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const originalRequest = err.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const status = err.response?.status;
    const isRefreshUrl =
      originalRequest?.url?.includes("/auth/refresh") ?? false;

    if (status === 403) {
      showToast("접근 권한이 없습니다.", "error");
      return Promise.reject(err);
    }

    if (status !== 401 || !originalRequest || isRefreshUrl) {
      return Promise.reject(err);
    }
    if (originalRequest._retry) {
      return Promise.reject(err);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => apiClient(originalRequest))
        .catch((e) => Promise.reject(e));
    }

    isRefreshing = true;
    originalRequest._retry = true;

    try {
      await apiClient.post("/auth/refresh");
      processQueue(null);
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as Error);
      // 인증이 반드시 필요한 라우트(개인 정보·관리자·알림)에서만 로그인 페이지로 강제 이동.
      // 그 외(스터디·공지·게시글·회원 프로필 등)는 비회원도 둘러볼 수 있어야 하므로
      // 부수 API 호출이 401을 반환해도 강제 이동시키지 않는다.
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        const isAuthRequired =
          path === "/members/me" ||
          path.startsWith("/members/me/") ||
          path === "/admin" ||
          path.startsWith("/admin/") ||
          path.startsWith("/notifications");
        if (isAuthRequired) {
          const redirect = encodeURIComponent(path + window.location.search);
          window.location.href = `/login?redirect=${redirect}`;
        }
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export function unwrapData<T>(res: { data: ApiResponse<T> }): T | null {
  return res.data?.data ?? null;
}
