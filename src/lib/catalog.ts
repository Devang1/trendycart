import { prisma } from "@/lib/prisma";

export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { approved: true, featured: true },
    include: { category: true, categories: true, seller: true },
    take: 8,
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }]
  });
}

export async function getShopProducts(searchParams: {
  q?: string;
  category?: string;
  brand?: string;
  min?: string;
  max?: string;
  sort?: string;
}) {
  const orderBy =
    searchParams.sort === "price-asc"
      ? { price: "asc" as const }
      : searchParams.sort === "price-desc"
        ? { price: "desc" as const }
        : searchParams.sort === "rating"
          ? { rating: "desc" as const }
          : { createdAt: "desc" as const };

  return prisma.product.findMany({
    where: {
      approved: true,
      name: searchParams.q ? { contains: searchParams.q, mode: "insensitive" } : undefined,
      OR: searchParams.category
        ? [
            { category: { slug: searchParams.category } },
            { categories: { some: { slug: searchParams.category } } }
          ]
        : undefined,
      brand: searchParams.brand ? { equals: searchParams.brand, mode: "insensitive" } : undefined,
      price: {
        gte: searchParams.min ? Number(searchParams.min) : undefined,
        lte: searchParams.max ? Number(searchParams.max) : undefined
      }
    },
    include: { category: true, categories: true, seller: true },
    orderBy
  });
}
