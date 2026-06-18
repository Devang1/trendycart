import { PrismaClient, Role, ApprovalStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

async function main() {
  const password = await bcrypt.hash("Password@123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@trendycart.dev" },
    update: {},
    create: { name: "TrendyCart Admin", email: "admin@trendycart.dev", password, role: Role.ADMIN }
  });

  const sellerUser = await prisma.user.upsert({
    where: { email: "seller@trendycart.dev" },
    update: {},
    create: { name: "Aarav Seller", email: "seller@trendycart.dev", password, role: Role.SELLER }
  });

  const seller = await prisma.seller.upsert({
    where: { userId: sellerUser.id },
    update: {},
    create: {
      userId: sellerUser.id,
      storeName: "Urban Loom",
      slug: "urban-loom",
      approvalStatus: ApprovalStatus.APPROVED,
      description: "Premium everyday style, curated for fast-moving wardrobes.",
      storeLogo: image("photo-1529139574466-a303027c1d8b")
    }
  });

  const categories = await Promise.all(
    [
      ["Fashion", "fashion", "photo-1483985988355-763728e1935b"],
      ["Sneakers", "sneakers", "photo-1542291026-7eec264c27ff"],
      ["Electronics", "electronics", "photo-1498049794561-7780e7231661"],
      ["Beauty", "beauty", "photo-1596462502278-27bfdc403348"]
    ].map(([name, slug, img]) =>
      prisma.category.upsert({
        where: { slug },
        update: {},
        create: { name, slug, image: image(img) }
      })
    )
  );

  const products = [
    ["AeroFlex Running Sneakers", "aeroflex-running-sneakers", "StrideCloud", 5299, 4299, categories[1].id, "photo-1542291026-7eec264c27ff"],
    ["Luxe Linen Overshirt", "luxe-linen-overshirt", "Urban Loom", 2999, 2199, categories[0].id, "photo-1529139574466-a303027c1d8b"],
    ["NoiseFlow ANC Headphones", "noiseflow-anc-headphones", "VoltEdge", 8999, 7499, categories[2].id, "photo-1505740420928-5e560c06d30e"],
    ["GlowSet Serum Kit", "glowset-serum-kit", "Nira Beauty", 2499, 1899, categories[3].id, "photo-1596462502278-27bfdc403348"]
  ] as const;

  for (const [name, slug, brand, price, discountPrice, categoryId, img] of products) {
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        sellerId: seller.id,
        categoryId,
        categories: { connect: [{ id: categoryId }] },
        name,
        slug,
        brand,
        price,
        discountPrice,
        stock: 48,
        images: [image(img), image("photo-1441986300917-64674bd600d8")],
        description: `${name} blends premium materials, dependable performance, and a polished TrendyCart buying experience.`,
        featured: true,
        approved: true,
        rating: 4.6,
        reviewCount: 128,
        sku: `TC-${slug.toUpperCase().slice(0, 12)}`,
        tags: ["trending", "premium"],
        specifications: { warranty: "1 year", origin: "India", delivery: "2-4 days" }
      }
    });
  }

  await prisma.platformSetting.upsert({
    where: { key: "commission" },
    update: { value: { defaultRate: 8.5 } },
    create: { key: "commission", value: { defaultRate: 8.5 } }
  });

  console.log({ admin: admin.email, seller: sellerUser.email, password: "Password@123" });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
