import { NextResponse } from "next/server";

export function middleware(req) {
  const cookieStore = req.cookies;
  const token = cookieStore.get("authToken")?.value;

  // Redirect to login if no token is found
  if (!token) {
    console.log("No token found in cookies, redirecting to /login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Allow the request to proceed
  console.log("Authorized user. Token found in cookies.");
  return NextResponse.next();
}

// Middleware applies only to protected routes
export const config = {
  matcher: [
    "/dies/:path*",
    "/gallery/:path*",
    "/locations/:path*",
    "/protected/:path*",
    "/",
  ],
};
