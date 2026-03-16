"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useEffect } from "react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAdmin = useAuthStore((s) => s.user?.role === "ROLE_ADMIN");
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user && !isAdmin) {
      router.replace("/");
    }
  }, [user, isAdmin, router]);

  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-neutral-500">권한이 없습니다.</p>
      </div>
    );
  }

  return <>{children}</>;
}
