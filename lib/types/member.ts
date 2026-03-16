import type { MemberInfo } from "./auth";

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

export type { MemberInfo };
