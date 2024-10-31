import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname === "/login";

    // If the user is on the login page and is already authenticated,
    // redirect them to the dashboard
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If the user is not authenticated and not on the login page,
    // redirect them to login
    if (!isAuth && !isAuthPage) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(from)}`, req.url)
      );
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
  matcher: ["/dashboard/:path*", "/gatepass/:path*", "/admin/:path*", "/login"],
};
