import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ include: { _count: { select: { products: true, categorizedProducts: true } } } });
  return (
    <div className="container py-10 md:py-14">
      <div className="max-w-2xl">
        <p className="text-sm font-bold uppercase text-primary">Departments</p>
        <h1 className="mt-2 text-4xl font-black tracking-normal">Categories</h1>
        <p className="mt-3 text-muted-foreground">Browse every aisle of TrendyCart, from daily essentials to standout seasonal finds.</p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((category) => (
          <Link key={category.id} href={`/shop?category=${category.slug}`} className="group overflow-hidden rounded-lg border bg-card shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
            <div className="relative aspect-[16/11] bg-muted">
              {category.image ? (
                <Image src={category.image} alt={category.name} fill sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/18 via-accent/16 to-secondary/18" />
              )}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xl font-bold">{category.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{Math.max(category._count.products, category._count.categorizedProducts)} products</p>
                </div>
                <span className="rounded-md border p-2 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
