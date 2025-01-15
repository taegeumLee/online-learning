import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;
    const isAuthPage =
      pathname.startsWith("/login") || pathname.startsWith("/register");

    // 1. 인증되지 않은 사용자 처리
    if (!token) {
      // 인증 페이지는 접근 허용
      if (isAuthPage) {
        return NextResponse.next();
      }
      // 그 외의 모든 페이지는 로그인 페이지로 리다이렉트
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // 2. 인증된 사용자 처리
    const userRole = token.role as string;

    // 2-1. 인증된 사용자가 로그인/회원가입 페이지 접근 시도
    if (isAuthPage) {
      // 역할에 따라 적절한 홈페이지로 리다이렉트
      const redirectUrl = userRole === "admin" ? "/admin/home" : "/user/home";
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    // 2-2. 루트 경로("/") 접근 시 역할에 따른 홈페이지로 리다이렉트
    if (pathname === "/") {
      const homeUrl = userRole === "admin" ? "/admin/home" : "/user/home";
      return NextResponse.redirect(new URL(homeUrl, req.url));
    }

    // 2-3. 권한별 페이지 접근 제어
    if (pathname.startsWith("/admin") && userRole !== "admin") {
      // 관리자가 아닌 사용자가 관리자 페이지 접근 시도 시 로그인 페이지로 리다이렉트
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (pathname.startsWith("/user") && userRole !== "user") {
      // 일반 사용자가 아닌 사용자가 사용자 페이지 접근 시도 시 로그인 페이지로 리다이렉트
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // 2-4. API 라우트 접근 제어
    if (pathname.startsWith("/api")) {
      // API 요청에 대한 권한 검사 실패 시 403 Forbidden 응답
      if (
        (pathname.startsWith("/api/admin") && userRole !== "admin") ||
        (pathname.startsWith("/api/user") && userRole !== "user")
      ) {
        return new NextResponse(
          JSON.stringify({
            error: "Forbidden",
            message: "You don't have permission to access this resource",
          }),
          {
            status: 403,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
