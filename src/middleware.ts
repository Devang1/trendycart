// import { withAuth } from "next-auth/middleware";
// import { NextResponse } from "next/server";

// export default withAuth(
//   function middleware(req) {
//     const role = req.nextauth.token?.role;
//     const pathname = req.nextUrl.pathname;

//     if (pathname.startsWith("/admin") && role !== "ADMIN") {
//       return NextResponse.redirect(new URL("/", req.url));
//     }

//     if (
//       pathname.startsWith("/seller") &&
//       !["SELLER", "ADMIN"].includes(String(role))
//     ) {
//       return NextResponse.redirect(new URL("/", req.url));
//     }

//     return NextResponse.next();
//   },
//   {
//     secret: process.env.NEXTAUTH_SECRET,

//     callbacks: {
//       authorized: ({ token, req }) => {
//         const protectedPaths = [
//           "/admin",
//           "/seller",
//           "/profile",
//           "/orders",
//           "/checkout",
//           "/wishlist",
//         ];

//         const isProtected = protectedPaths.some((path) =>
//           req.nextUrl.pathname.startsWith(path)
//         );

//         return isProtected ? !!token : true;
//       },
//     },
//   }
// );

// export const config = {
//   matcher: [
//     "/admin/:path*",
//     "/seller/:path*",
//     "/profile/:path*",
//     "/orders/:path*",
//     "/checkout/:path*",
//     "/wishlist/:path*",
//   ],
// };
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const pathname = req.nextUrl.pathname;

  // Not logged in
  if (!token) {
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url)
    );
  }

  const role = token.role as string;

  // Admin routes
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Seller routes
  if (
    pathname.startsWith("/seller") &&
    !["SELLER", "ADMIN"].includes(role)
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

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