import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    console.log("PATH:", req.nextUrl.pathname);
    console.log("TOKEN:", req.nextauth.token);

    const role = req.nextauth.token?.role;
    const pathname = req.nextUrl.pathname;

    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      console.log("Admin access denied");
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (
      pathname.startsWith("/seller") &&
      !["SELLER", "ADMIN"].includes(String(role))
    ) {
      console.log("Seller access denied");
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        console.log("AUTHORIZED PATH:", req.nextUrl.pathname);
        console.log("AUTHORIZED TOKEN:", token);

        const protectedPath = [
          "/admin",
          "/seller",
          "/profile",
          "/orders",
          "/checkout",
          "/wishlist",
        ];

        return protectedPath.some((path) =>
          req.nextUrl.pathname.startsWith(path)
        )
          ? Boolean(token)
          : true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/seller/:path*",
    "/profile/:path*",
    "/orders/:path*",
    "/checkout/:path*",
    "/wishlist/:path*",
  ],
};