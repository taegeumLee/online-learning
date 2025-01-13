import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;
    const isAuthPage =
      pathname.startsWith("/login") || pathname.startsWith("/register");
    const isAdminPage = pathname.startsWith("/admin");
    const isStudentPage = pathname.startsWith("/student");
    const isApiRoute = pathname.startsWith("/api");

    // 1. 인증되지 않은 사용자 처리
    if (!token) {
      // 인증 페이지는 접근 허용
      if (isAuthPage) {
        return NextResponse.next();
      }
      // API 요청은 401 응답
      if (isApiRoute) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      // 그 외의 경우 로그인 페이지로 리다이렉트
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // 2. 인증된 사용자의 권한 검사
    const userRole = token.role as string;

    // 2-1. 인증된 사용자가 auth 페이지 접근 시도
    if (isAuthPage) {
      // 역할에 따라 적절한 홈페이지로 리다이렉트
      const redirectUrl = userRole === "admin" ? "/admin/home" : "/user/home";
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    // 2-2. 관리자 페이지 접근 제어
    if (isAdminPage && userRole !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // 2-3. 학생 페이지 접근 제어
    if (isStudentPage && userRole !== "user") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // 2-4. API 라우트 접근 제어
    if (isApiRoute) {
      if (pathname.startsWith("/api/admin") && userRole !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (pathname.startsWith("/api/student") && userRole !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // 모든 요청을 허용하고 위의 미들웨어에서 처리
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
