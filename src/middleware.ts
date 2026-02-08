import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/outings/new"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected =
    protectedPaths.some((p) => pathname.startsWith(p)) ||
    pathname.match(/\/outings\/[^/]+\/edit/);

  if (!isProtected) {
    return NextResponse.next();
  }

  const token =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads).*)"],
};
