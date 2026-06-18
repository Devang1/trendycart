import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    const pathname = req.nextUrl.pathname;

    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (pathname.startsWith("/seller") && !["SELLER", "ADMIN"].includes(String(role))) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const protectedPath = ["/admin", "/seller", "/profile", "/orders", "/checkout", "/wishlist"];
        return protectedPath.some((path) => req.nextUrl.pathname.startsWith(path)) ? Boolean(token) : true;
      }
    }
  }
);

export const config = {
  matcher: ["/admin/:path*", "/seller/:path*", "/profile/:path*", "/orders/:path*", "/checkout/:path*", "/wishlist/:path*"]
};
