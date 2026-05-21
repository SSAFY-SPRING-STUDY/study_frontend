import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access-token")?.value;
  const { pathname } = request.nextUrl;

  // 루트 라우팅 제어 — 비회원도 둘러볼 수 있도록 /studies 로 안내
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/studies";
    return NextResponse.redirect(url);
  }

  // 로그인 필수 라우트 (비회원에게는 노출하지 않음)
  //   /members/me, /members/me/*  — 본인 정보
  //   /admin, /admin/*            — 관리자 영역
  //   /notifications              — 개인 알림
  const isAuthRequired =
    pathname === "/members/me" ||
    pathname.startsWith("/members/me/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/notifications");

  if (isAuthRequired && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // 관리자 라우트 보호 (ADMIN ONLY)
  if (pathname.startsWith("/admin") && token) {
    try {
      const payload = token.split(".")[1];
      if (payload) {
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const parsed = JSON.parse(jsonPayload);

        if (parsed.role !== "ROLE_ADMIN") {
          const url = request.nextUrl.clone();
          url.pathname = "/studies";
          return NextResponse.redirect(url);
        }
      }
    } catch (error) {
      // 파싱 불능이어도 그냥 넘김 (보통은 403 API에서 터짐)
      console.error("JWT Parse Error in middleware:", error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|signup).*)"],
};
