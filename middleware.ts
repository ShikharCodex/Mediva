import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/config/constants";

const protectedRoutes = ["/dashboard"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((pathname === "/login" || pathname === "/register") && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
