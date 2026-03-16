import Link from "next/link";
import { AdminGuard } from "@/components/guards/AdminGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="flex gap-8">
        <aside className="w-48 shrink-0">
          <nav className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-4">
            <Link
              href="/admin/studies"
              className="text-sm font-medium text-neutral-700 hover:text-neutral-900"
            >
              스터디 관리
            </Link>
            <Link
              href="/admin/notices"
              className="text-sm font-medium text-neutral-700 hover:text-neutral-900"
            >
              공지사항 관리
            </Link>
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </AdminGuard>
  );
}
