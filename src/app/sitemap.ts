import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({ where: { approved: true }, select: { slug: true, updatedAt: true } });
  const staticRoutes = ["", "/shop", "/categories", "/about", "/contact", "/privacy-policy", "/terms-and-conditions"];
  return [
    ...staticRoutes.map((route) => ({ url: absoluteUrl(route), lastModified: new Date() })),
    ...products.map((product) => ({ url: absoluteUrl(`/product/${product.slug}`), lastModified: product.updatedAt }))
  ];
}
