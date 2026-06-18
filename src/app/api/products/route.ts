import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getShopProducts } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { productSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const products = await getShopProducts(Object.fromEntries(url.searchParams.entries()));
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SELLER", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const seller = await prisma.seller.findUnique({ where: { userId: session.user.id } });
  if (!seller && session.user.role !== "ADMIN") return NextResponse.json({ error: "Seller profile required" }, { status: 400 });

  const parsed = productSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
  const { categoryIds, ...productData } = parsed.data;

  const product = await prisma.product.create({
    data: {
      ...productData,
      sellerId: seller?.id ?? (await prisma.seller.findFirstOrThrow()).id,
      categoryId: categoryIds[0],
      categories: { connect: categoryIds.map((id) => ({ id })) },
      slug: `${slugify(productData.name)}-${Date.now()}`,
      sku: `TC-${Date.now()}`,
      tags: [],
      approved: session.user.role === "ADMIN"
    }
  });

  return NextResponse.json(product, { status: 201 });
}
