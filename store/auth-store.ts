"use client";

import { create } from "zustand";
import type { MemberInfo } from "@/lib/types/auth";

interface AuthState {
  user: MemberInfo | null;
  setUser: (user: MemberInfo | null) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));

export function useIsAdmin(): boolean {
    return useAuthStore((s) => s.user?.role === "ROLE_ADMIN") ?? false;
}