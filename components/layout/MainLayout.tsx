"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => {
      setIsDesktop(mq.matches);
      if (mq.matches) setSidebarOpen(false);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSidebarOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

  // 비회원: Sidebar 미노출, Header를 데스크탑에서도 보이게 하여 로그인/회원가입/GitHub 진입점 확보
  const showHeader = !user || !isDesktop;

  return (
    <div className="flex min-h-screen bg-[var(--surface)]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        {showHeader && (
          <Header onToggleSidebarAction={() => setSidebarOpen((v) => !v)} />
        )}
        <main className="flex-1 bg-[var(--surface-container-high)] px-6 py-10 lg:px-8">
          <div className="mx-auto max-w-[1400px]">
            <div className="ui-card-static px-6 py-8 md:px-8">{children}</div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
