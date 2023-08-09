import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { env } from "./lib/env";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const response = NextResponse.next();

  if (token) {
    // verify token
    try {
      await jwtVerify(token.value, new TextEncoder().encode(env.SECRET));
      return response;
    } catch (err) {
      // If the token is invalid, remove it from the cookies
      response.cookies.set("token", "", {
        expires: new Date(0),
      });
    }
  }

  // Redirect to the home page
  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: "/g/:path*",
};
