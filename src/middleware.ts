import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname === "/login";
    const isApiRoute = req.nextUrl.pathname.startsWith("/api");

    // If the user is on the login page and is already authenticated,
    // redirect them to the dashboard
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If the user is not authenticated and not on the login page,
    // redirect them to login
    if (!isAuth && !isAuthPage) {
      if (isApiRoute) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(from)}`, req.url)
      );
    }

    // Role-based API route protection
    if (isApiRoute) {
      const role = token?.role;

      // Admin can access all routes
      if (role === "ADMIN") {
        return NextResponse.next();
      }

      // Dispatch routes
      if (
        req.nextUrl.pathname.startsWith("/api/dispatch") &&
        role !== "DISPATCH"
      ) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

      // Guard routes
      if (req.nextUrl.pathname.startsWith("/api/guard") && role !== "GUARD") {
        return new NextResponse("Unauthorized", { status: 401 });
      }

      // Warehouse routes
      if (
        req.nextUrl.pathname.startsWith("/api/warehouse") &&
        role !== "WAREHOUSE"
      ) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
    }

    // Allow the request to proceed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => true, // Always run the middleware function
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Protect these routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/gatepass/:path*",
    "/admin/:path*",
    "/dispatch/:path*",
    "/guard/:path*",
    "/warehouse/:path*",
    "/api/:path*",
    "/login",
  ],
};
