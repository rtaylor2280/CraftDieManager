import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("authToken");
  console.log("Token in Middleware:", token);

  // Redirect to login if no token is found
  if (!token) {
    console.log("No token found in cookies, redirecting to /login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Middleware applies only to protected routes
export const config = {
  matcher: ["/protected/:path*"], // Adjust as needed for your app
};
