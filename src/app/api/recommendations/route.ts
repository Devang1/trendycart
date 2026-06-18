import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const viewed = session?.user
    ? await prisma.recentlyViewed.findMany({ where: { userId: session.user.id }, select: { product: { select: { categoryId: true, categories: { select: { id: true } }, brand: true } } }, take: 8, orderBy: { viewedAt: "desc" } })
    : [];
  const categoryIds = Array.from(new Set(viewed.flatMap((item) => [item.product.categoryId, ...item.product.categories.map((category) => category.id)])));
  const brands = viewed.map((item) => item.product.brand);
  const products = await prisma.product.findMany({
    where: {
      approved: true,
      OR: categoryIds.length || brands.length
        ? [
            { categoryId: { in: categoryIds } },
            { categories: { some: { id: { in: categoryIds } } } },
            { brand: { in: brands } }
          ]
        : [{ featured: true }]
    },
    include: { category: true, categories: true },
    take: 8,
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }]
  });

  return NextResponse.json({ strategy: "behavioral-collaborative-lite", products });
}
