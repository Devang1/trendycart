"use client";

import { ShoppingBag, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

type ProductCardProps = {
  compact?: boolean;
  initialWishlisted?: boolean;
  product: {
    id: string;
    name: string;
    slug: string;
    brand: string;
    price: unknown;
    discountPrice?: unknown;
    stock: number;
    images: string[];
    rating: unknown;
    category?: {
      name: string;
      slug: string;
    } | null;
    categories?: Array<{
      name: string;
      slug: string;
    }>;
  };
};

export function ProductCard({ product, compact = false, initialWishlisted = false }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const price = Number(product.discountPrice ?? product.price);
  const originalPrice = Number(product.price);
  const discountPercent = product.discountPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;
  const categoryLabel = product.categories?.[0]?.name ?? product.category?.name;

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
      <Link href={`/product/${product.slug}`} className="block">
        <div className={`relative overflow-hidden bg-muted ${compact ? "aspect-[4/3]" : "aspect-[5/6] sm:aspect-[6/7]"}`}>
          <Image src={product.images[0] ?? "/discover.png"} alt={product.name} fill sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 45vw" className="object-cover transition duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
          {discountPercent > 0 ? (
            <span className="absolute left-2 top-2 rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-black text-accent-foreground shadow sm:px-2">
              {discountPercent}% off
            </span>
          ) : null}
          {categoryLabel ? (
            <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-md bg-background/90 px-1.5 py-0.5 text-[10px] font-bold shadow backdrop-blur sm:px-2">
              {categoryLabel}
            </span>
          ) : null}
        </div>
      </Link>
      <div className={`flex flex-1 flex-col ${compact ? "space-y-1 p-2" : "space-y-1.5 p-2.5 sm:p-3"}`}>
        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-xs font-semibold uppercase text-primary">{product.brand}</p>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground sm:bg-transparent sm:p-0 sm:text-xs sm:text-amber-500"><Star className="h-3 w-3 fill-current" /> {Number(product.rating).toFixed(1)}</span>
          </div>
          <Link href={`/product/${product.slug}`} className={`mt-1 line-clamp-2 font-semibold transition hover:text-primary ${compact ? "text-xs leading-4" : "text-xs leading-5 sm:text-sm"}`}>{product.name}</Link>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="min-w-0">
            <span className={compact ? "text-sm font-bold" : "text-sm font-bold sm:text-base"}>{formatPrice(price)}</span>
            {product.discountPrice ? <span className="ml-1 text-[11px] text-muted-foreground line-through sm:text-xs">{formatPrice(originalPrice)}</span> : null}
          </div>
          <span className={product.stock > 0 ? "text-[11px] font-bold text-primary" : "text-[11px] font-bold text-destructive"}>
            {product.stock > 0 ? "In stock" : "Sold out"}
          </span>
        </div>
        <div className={`mt-auto flex gap-1.5 ${compact ? "pt-0.5" : "pt-1"}`}>
          <Button
            className={compact ? "h-7 flex-1 px-2 text-[11px]" : "h-8 flex-1 px-2 text-xs sm:h-9"}
            disabled={product.stock <= 0}
            onClick={() => {
              addItem({ id: product.id, name: product.name, slug: product.slug, image: product.images[0], price, stock: product.stock });
              toast.success("Added to cart");
            }}
          >
            <ShoppingBag className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} /> Add
          </Button>
          <WishlistButton
            productId={product.id}
            initialWishlisted={initialWishlisted}
            showLabel={false}
            className={compact ? "h-7 w-7" : "h-8 w-8 sm:h-9 sm:w-9"}
            iconClassName="h-3.5 w-3.5"
          />
        </div>
      </div>
    </article>
  );
}
