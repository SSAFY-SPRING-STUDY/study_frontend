"use client";

import { apiClient, unwrapData } from "./client";
import type { Page, ApiResponse } from "@/lib/types/api";
import type { NotificationResponse } from "@/lib/types/notification";
import { API_V1_BASE } from "@/lib/env";

export async function getNotifications(params?: {
  page?: number;
  size?: number;
}): Promise<Page<NotificationResponse>> {
  const { page = 0, size = 20 } = params ?? {};
  const res = await apiClient.get<ApiResponse<Page<NotificationResponse>>>(
    "/notifications",
    { params: { page, size, sort: "createdAt,desc" } }
  );
  const data = unwrapData(res);
  if (!data)
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 20,
      first: true,
      last: true,
      empty: true,
    };
  return data;
}

export async function markNotificationRead(
  notificationId: number
): Promise<void> {
  await apiClient.patch(`/notifications/${notificationId}/read`);
}

export function createNotificationEventSource(): EventSource {
  return new EventSource(`${API_V1_BASE}/notifications/subscribe`, {
    withCredentials: true,
  });
}
