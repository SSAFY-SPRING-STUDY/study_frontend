"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api/members";
import { useAuthStore } from "@/store/auth-store";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setUser, clearUser } = useAuthStore();
  const { data: user, isPending, isError } = useQuery({
    queryKey: ["members", "me"],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (user) setUser(user);
  }, [user, setUser]);

  useEffect(() => {
    if (!isPending && (isError || !user)) {
      clearUser();
      router.replace("/login");
    }
  }, [isPending, isError, user, router, clearUser]);

  if (isPending || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-neutral-500">로그인 확인 중...</p>
      </div>
    );
  }

  return <>{children}</>;
}
