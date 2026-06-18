import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ShareButton } from "@/components/shop/share-button";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton, BuyNowButton } from "@/components/shop/add-to-cart-button";
import { ReviewForm } from "@/components/shop/review-form";
import Image from "next/image";
import { 
  Star, 
  Truck, 
  Shield, 
  RotateCcw, 
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Package,
  Store,
  Tag,
  Users,
  CreditCard,
} from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  return product
    ? {
        title: `${product.name} | Shop`,
        description: product.description,
        openGraph: { 
          images: product.images,
          title: product.name,
          description: product.description,
        },
      }
    : {};
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { 
      category: true, 
      categories: true, 
      seller: true, 
      reviews: { 
        include: { user: { select: { name: true } } },
        take: 6,
        orderBy: { createdAt: "desc" }
      } 
    }
  });
  if (!product) notFound();
  
  const productCategoryIds = Array.from(new Set([
    product.categoryId,
    ...product.categories.map((category) => category.id)
  ]));

  const related = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      approved: true,
      OR: [
        { categoryId: { in: productCategoryIds } },
        { categories: { some: { id: { in: productCategoryIds } } } }
      ]
    },
    include: { category: true, categories: true },
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    take: 4
  });

  const avgRating = Number(product.rating);
  const cartProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    image: product.images[0] ?? "/discover.png",
    price: Number(product.discountPrice ?? product.price),
    stock: product.stock
  };
  const displayCategories = product.categories.length > 0 ? product.categories : [product.category];

  return (
    <div className="pb-28 lg:pb-20">
      {/* Mobile Sticky Header */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/shop" className="flex items-center gap-1 text-sm font-medium">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
          <span className="text-sm font-medium truncate max-w-[150px]">{product.name}</span>
          <div className="flex items-center gap-1">
              <WishlistButton
                productId={product.id}
                showLabel={false}
                className="h-8 w-8 rounded-full border-0 bg-transparent p-0 shadow-none hover:bg-muted"
              />
            <ShareButton
              title={product.name}
              description={product.description}
              url={`/product/${product.slug}`}
              iconOnly
              className="bg-transparent shadow-none hover:bg-muted"
            />
          </div>
        </div>
      </div>

      <div className="container py-4 md:py-8">
        {/* Desktop Breadcrumb */}
        <nav className="mb-6 hidden items-center gap-2 text-sm lg:flex">
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
          <span className="text-muted-foreground">/</span>
          <Link href="/shop" className="text-muted-foreground hover:text-primary transition-colors">Shop</Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
          {/* Product Images - Mobile Optimized */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
              <Image 
                src={product.images[0] ?? "/discover.png"}
                alt={product.name} 
                fill 
                priority 
                className="object-cover" 
              />
              {product.discountPrice && (
                <div className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-lg md:left-4 md:top-4">
                  {Math.round((1 - Number(product.discountPrice) / Number(product.price)) * 100)}% OFF
                </div>
              )}
              {product.stock > 0 && product.stock < 10 && (
                <div className="absolute bottom-3 left-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg md:bottom-4 md:left-4">
                  Only {product.stock} left
                </div>
              )}
              {/* Mobile Image Counter */}
              {product.images.length > 1 && (
                <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-sm md:hidden">
                  1/{product.images.length}
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:gap-3">
                {product.images.slice(1, 5).map((image, index) => (
                  <div 
                    key={image} 
                    className="relative aspect-square min-w-[80px] overflow-hidden rounded-lg border-2 bg-muted hover:border-primary transition-colors cursor-pointer md:min-w-0"
                  >
                    <Image src={image} alt={`${product.name} - ${index + 2}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-5">
            {/* Brand & Seller */}
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Link 
                href={`/shop?brand=${product.brand}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary hover:bg-primary/20 transition-colors"
              >
                <Tag className="h-3.5 w-3.5" />
                {product.brand}
              </Link>
              <span className="text-muted-foreground">by</span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Store className="h-3.5 w-3.5 text-muted-foreground" />
                {product.seller.storeName}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{product.name}</h1>

            {/* Rating - Interactive */}
            <div className="flex items-center gap-3">
              <Link href="#reviews" className="flex items-center gap-2 group">
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[1,2,3,4,5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-4 w-4 ${
                          star <= Math.round(avgRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="font-semibold group-hover:text-primary transition-colors">
                    {avgRating.toFixed(1)}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                  ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              </Link>
            </div>

            {/* Price - Prominent */}
            <div className="rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 p-4 md:p-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black md:text-4xl">{formatPrice(Number(product.discountPrice ?? product.price))}</span>
                {product.discountPrice && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">{formatPrice(Number(product.price))}</span>
                    <span className="rounded-full bg-green-500/20 px-2.5 py-0.5 text-sm font-semibold text-green-600">
                      Save {formatPrice(Number(product.price) - Number(product.discountPrice))}
                    </span>
                  </>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Shipping charges apply at checkout
              </p>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed md:text-base">{product.description}</p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              <div className="flex items-center gap-2 rounded-lg border bg-card p-2.5 md:p-3">
                <Truck className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs font-medium md:text-sm">Delivery</p>
                  <p className="text-[10px] text-muted-foreground md:text-xs">{formatPrice(500)} shipping</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border bg-card p-2.5 md:p-3">
                <Shield className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs font-medium md:text-sm">Secure Payment</p>
                  <p className="text-[10px] text-muted-foreground md:text-xs">COD available</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border bg-card p-2.5 md:p-3">
                <RotateCcw className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs font-medium md:text-sm">Easy Returns</p>
                  <p className="text-[10px] text-muted-foreground md:text-xs">7 days policy</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border bg-card p-2.5 md:p-3">
                <Package className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs font-medium md:text-sm">Authentic</p>
                  <p className="text-[10px] text-muted-foreground md:text-xs">100% genuine</p>
                </div>
              </div>
            </div>

            {/* Stock & Categories */}
            <div className="space-y-3 rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Availability</span>
                <span className={`flex items-center gap-1.5 text-sm font-semibold ${
                  product.stock > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product.stock > 0 ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      In Stock
                    </>
                  ) : (
                    'Out of Stock'
                  )}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">Categories:</span>
                {displayCategories.map((category) => (
                  <Link 
                    key={category.id} 
                    href={`/shop?category=${category.slug}`} 
                    className="rounded-full bg-muted px-3 py-1 text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Bottom Action Bar */}
            <div className="fixed inset-x-0 bottom-0 z-[60] border-t bg-background/95 px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
              <div className="mx-auto grid max-w-lg grid-cols-2 gap-2">
                <AddToCartButton product={cartProduct} className="h-11 w-full" />
                <BuyNowButton product={cartProduct} className="h-11 w-full" />
              </div>
            </div>

            {/* Desktop Buttons */}
            <div className="hidden flex-col gap-3 lg:flex">
              <div className="flex gap-3">
                <AddToCartButton product={cartProduct} className="h-12 flex-1" />
                <BuyNowButton product={cartProduct} className="h-12 flex-1" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <WishlistButton
                    productId={product.id}
                    className="border-0 bg-transparent shadow-none"
                  />
                  <ShareButton
                    title={product.name}
                    description={product.description}
                    url={`/product/${product.slug}`}
                    className="gap-1.5"
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  <CreditCard className="inline h-3 w-3 mr-1" />
                  Secure checkout
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <section id="reviews" className="mt-12 scroll-mt-20 border-t pt-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Customer Reviews</h2>
              <p className="text-sm text-muted-foreground">
                {product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'}
              </p>
            </div>
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-3 rounded-lg bg-secondary/50 px-4 py-2">
                <span className="text-2xl font-bold">{avgRating.toFixed(1)}</span>
                <div className="flex">
                  {[1,2,3,4,5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-4 w-4 ${
                        star <= Math.round(avgRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">/ 5.0</span>
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            {product.reviews.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {product.reviews.map((review, index) => (
                <div 
                  key={review.id} 
                  className="group rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:-translate-y-0.5"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{review.user.name ?? "Anonymous"}</p>
                      <div className="mt-1 flex items-center gap-1">
                        {[1,2,3,4,5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-3 w-3 ${
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-y bg-muted/30 p-10 text-center sm:rounded-lg sm:border">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-3 font-medium">No reviews yet</p>
              <p className="text-sm text-muted-foreground">Be the first to review this product</p>
            </div>
            )}
            <ReviewForm productId={product.id} />
          </div>
        </section>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-12">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">More in {product.category.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">Highly rated products from the same category</p>
              </div>
              <Link href={`/shop?category=${product.category.slug}`} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                View all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard
                  key={item.id}
                  compact
                  product={{
                    id: item.id,
                    name: item.name,
                    slug: item.slug,
                    brand: item.brand,
                    price: Number(item.price),
                    discountPrice: item.discountPrice ? Number(item.discountPrice) : undefined,
                    stock: item.stock,
                    images: item.images,
                    rating: Number(item.rating),
                    category: item.category,
                    categories: item.categories
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
