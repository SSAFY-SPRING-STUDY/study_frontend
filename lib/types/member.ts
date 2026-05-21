import type { MemberInfo } from "./auth";

export type MemberRole = "ROLE_USER" | "ROLE_ADMIN";
export type MemberLevel = "BASIC" | "INTERMEDIATE" | "ADVANCED";

export interface AdminMemberResponse {
  id: number;
  email: string;
  name: string;
  nickname: string;
  level: MemberLevel;
  role: MemberRole;
}

export interface AdminMemberPage {
  content: AdminMemberResponse[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface AdminMemberUpdateRequest {
  name?: string;
  nickname?: string;
  role?: MemberRole;
  level?: MemberLevel;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  nickname: string;
}

export interface MemberUpdateRequest {
  name?: string;
  nickname?: string;
}

export interface PasswordUpdateRequest {
  currentPassword: string;
  newPassword: string;
}

export interface DescriptionUpdateRequest {
  description: string | null;
}

export interface ProfileImageUploadUrlRequest {
  contentType: string;
  contentLength: number;
}

export interface ProfileImageUploadUrlResponse {
  presignedUrl: string;
  imageKey: string;
}

export interface ProfileImageUpdateRequest {
  imageKey: string;
}

export type { MemberInfo };
