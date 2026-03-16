"use client";

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_V1_BASE } from "@/lib/env";
import type { ApiResponse } from "@/lib/types/api";

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
      if (typeof window !== "undefined") {
        window.location.href = "/login";
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
