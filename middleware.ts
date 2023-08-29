import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token");

  if (token) {
    try {
      // verify token
      await verifyToken(token.value);
    } catch (err) {
      const response = NextResponse.next();
      // If the token is invalid, remove it from the cookies
      response.cookies.delete("token");
      // Redirect to the home page
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/g/:path*",
};
