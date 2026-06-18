import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Gem,
  Home,
  Laptop,
  MonitorSmartphone,
  PackageSearch,
  Percent,
  Shirt,
  ShieldCheck,
  Sparkles,
  Tag,
  TrendingUp,
  Truck,
  Watch
} from "lucide-react";
import Hero from "@/components/home/hero";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getFeaturedProducts } from "@/lib/catalog";

const categoryIcons = [Shirt, MonitorSmartphone, Sparkles, Laptop, Home, Gem, Watch, PackageSearch];

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getFeaturedProducts(),
    prisma.category.findMany({ take: 10, orderBy: { name: "asc" } })
  ]);

  const firstRail = products.slice(0, 4);
  const secondRail = products.slice(4, 8).length ? products.slice(4, 8) : products.slice(0, 4);

  return (
    <div className="pb-24 md:pb-10">
      <Hero />
      <CategoryStrip categories={categories} />

      <ValueStrip />

      <ProductRail title="Best value deals" subtitle="Fashion, gadgets and everyday favorites with sharper pricing" products={firstRail} href="/shop" tint="bg-primary/10" badge="Hot picks" />

      <ProductRail title="Trending now" subtitle="Recently added items from verified sellers" products={secondRail} href="/shop?sort=new" tint="bg-accent/10" badge="New" />

      <section className="w-full px-0 pt-4 md:px-3 md:pt-5">
        <SectionHeader title="Shop by budget" subtitle="Simple shortcuts for quick decisions" href="/shop" />
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
  {[
    {
      title: "Under ₹499",
      text: "Everyday finds",
      href: "/shop?max=499",
      icon: Tag,
    },
    {
      title: "₹500 - ₹999",
      text: "Best value",
      href: "/shop?min=500&max=999",
      icon: Percent,
    },
    {
      title: "₹1K - ₹2.9K",
      text: "Upgrade lane",
      href: "/shop?min=1000&max=2999",
      icon: TrendingUp,
    },
    {
      title: "Premium",
      text: "Top rated",
      href: "/shop?min=3000",
      icon: Gem,
    },
  ].map(({ title, text, href, icon: Icon }) => (
    <Link
      key={title}
      href={href}
      className="group flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 transition-all hover:border-primary/30 hover:shadow-sm"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{text}</p>
      </div>

      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  ))}
</div>
      </section>

      <section className="w-full px-0 pt-4 md:px-3 md:pt-5">
        <div className="grid gap-3 md:grid-cols-[1.2fr_.8fr]">
          <Link href="/shop?sort=new" className="group border bg-secondary p-6 text-secondary-foreground shadow-sm transition hover:-translate-y-1 hover:shadow-xl md:rounded-lg">
            <p className="text-sm font-bold text-accent">Fresh arrivals</p>
            <h2 className="mt-2 max-w-xl text-2xl font-black tracking-normal sm:text-3xl">New drops from verified TrendyCart sellers</h2>
            <p className="mt-3 max-w-lg text-sm text-white/75">Explore fashion, electronics, home essentials, and accessories added to the marketplace.</p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-black text-secondary">Shop new <ArrowRight className="h-4 w-4" /></span>
          </Link>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            <Link href="/orders" className="border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg md:rounded-lg">
              <Truck className="h-5 w-5 text-primary" />
              <p className="mt-3 font-black">Track every order</p>
              <p className="mt-1 text-sm text-muted-foreground">See delivery dates, status updates, tracking IDs, and remarks.</p>
            </Link>
            <Link href="/wishlist" className="border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg md:rounded-lg">
              <Sparkles className="h-5 w-5 text-accent" />
              <p className="mt-3 font-black">Build your wishlist</p>
              <p className="mt-1 text-sm text-muted-foreground">Save products now and compare your favorites later.</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ValueStrip() {
  const items = [
    { icon: Truck, title: "Fast dispatch", text: "On eligible items" },
    { icon: ShieldCheck, title: "Secure checkout", text: "Razorpay and COD" },
    { icon: PackageSearch, title: "Live tracking", text: "Status and remarks" },
    { icon: Sparkles, title: "Fresh drops", text: "Updated catalog" }
  ];

  return (
    <section className="w-full px-0 pt-4 md:px-3 md:pt-5">
  <div className="grid grid-cols-4 gap-1 border-y bg-card p-2 shadow-sm md:gap-2 md:rounded-lg md:border">
    {items.map(({ icon: Icon, title, text }) => (
      <div
        key={title}
        className="flex flex-col items-center justify-center rounded-md bg-background p-2 text-center md:flex-row md:items-center md:gap-3 md:p-3 md:text-left"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary md:h-10 md:w-10">
          <Icon className="h-4 w-4 md:h-5 md:w-5" />
        </span>

        <div>
          <p className="mt-1 text-[10px] font-bold leading-tight md:mt-0 md:text-sm">
            {title}
          </p>

          <p className="hidden text-xs text-muted-foreground md:block">
            {text}
          </p>
        </div>
      </div>
    ))}
  </div>
</section>
  );
}


function CategoryStrip({ categories }: { categories: Awaited<ReturnType<typeof prisma.category.findMany>> }) {
  return (
    <section className="w-full pt-3 md:px-3">
      <div className="overflow-x-auto border-y bg-card shadow-sm md:rounded-lg md:border">
        <div className="flex min-w-max items-stretch gap-2 px-2 py-2.5 md:min-w-0 md:justify-between md:px-3">
          {categories.slice(0, 8).map((category, index) => {
            const Icon = categoryIcons[index % categoryIcons.length];
            return (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className="group flex min-w-20 flex-col items-center justify-center gap-1.5 rounded-md px-1.5 py-1 text-center transition hover:bg-muted sm:min-w-24"
              >
                <span className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-muted text-primary ring-1 ring-border transition group-hover:bg-primary group-hover:text-primary-foreground sm:h-16 sm:w-16">
                  {category.image ? (
                    <Image src={category.image} alt="" fill sizes="64px" className="object-cover" />
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                </span>
                <span className="max-w-20 truncate text-xs font-semibold sm:max-w-24">{category.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProductRail({
  title,
  subtitle,
  products,
  href,
  tint,
  badge
}: {
  title: string;
  subtitle: string;
  products: Awaited<ReturnType<typeof getFeaturedProducts>>;
  href: string;
  tint: string;
  badge?: string;
}) {
  if (!products.length) return null;

  return (
    <section className="w-full px-0 pt-4 md:px-3 md:pt-5">
      <div className={`border p-3 shadow-sm md:rounded-lg ${tint}`}>
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black tracking-normal sm:text-2xl">{title}</h2>
              {badge ? <span className="rounded bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground">{badge}</span> : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <Button asChild size="sm" variant="outline" aria-label={`View ${title}`}>
            <Link href={href} className="inline-flex items-center gap-1">View <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          {products.map((product) => <ProductCard key={product.id} product={product} compact />)}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ title, subtitle, href }: { title: string; subtitle: string; href: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-black tracking-normal sm:text-2xl">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <Button asChild size="icon" aria-label={title}>
        <Link href={href}><ArrowRight className="h-4 w-4" /></Link>
      </Button>
    </div>
  );
}
