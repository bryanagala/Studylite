import { NextResponse, type NextRequest } from "next/server";

/** Admin auth is enforced in server layouts/actions via Railway session cookie. */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
