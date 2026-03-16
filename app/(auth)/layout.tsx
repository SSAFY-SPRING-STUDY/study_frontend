import { AuthGuard } from "@/components/guards/AuthGuard";
import { MainLayout } from "@/components/layout/MainLayout";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <MainLayout>{children}</MainLayout>
    </AuthGuard>
  );
}
