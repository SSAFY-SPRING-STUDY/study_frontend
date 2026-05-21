"use client";

import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api/members";
import { useAuthStore } from "@/store/auth-store";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { setUser, clearUser } = useAuthStore();
  
  // 로그인 검증은 app/middleware.ts가 1차적으로 진행하므로
  // 여기서는 단순히 멤버 정보를 가져와 Store에 동기화합니다.
  const { data: user, isError } = useQuery({
    queryKey: ["members", "me"],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  // 만약 토큰이 위조되었거나 만료되었다면 clear
  useEffect(() => {
    if (isError) {
      clearUser();
    }
  }, [isError, clearUser]);

  return <>{children}</>;
}
