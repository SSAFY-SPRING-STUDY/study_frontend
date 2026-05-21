import { Suspense } from "react";
import { NoticesClient } from "./NoticesClient";

export default function NoticeListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[200px] items-center justify-center">
          <div
            className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--surface-container-high)] border-t-[var(--primary)]"
            role="status"
            aria-label="로딩 중"
          />
        </div>
      }
    >
      <NoticesClient />
    </Suspense>
  );
}
