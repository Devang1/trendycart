import Link from "next/link";
import { 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  X, 
  ChevronDown, 
  Filter, 
  SortAsc, 
  Tag, 
  Building2, 
  DollarSign,
  RotateCcw,
  Grid3x3,
  LayoutList
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { getShopProducts } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

export default async function ShopPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; category?: string; brand?: string; min?: string; max?: string; sort?: string }>;
}) {
  const params = await searchParams;
  
  // Validate and clean min/max values
  const cleanedParams = {
    ...params,
    min: params.min && !isNaN(Number(params.min)) ? String(Number(params.min)) : undefined,
    max: params.max && !isNaN(Number(params.max)) ? String(Number(params.max)) : undefined,
  };

  const [products, categories] = await Promise.all([
    getShopProducts(cleanedParams),
    prisma.category.findMany({ orderBy: { name: "asc" } })
  ]);
  
  const hasFilters = Boolean(
    cleanedParams.q || 
    cleanedParams.category || 
    cleanedParams.brand || 
    cleanedParams.min || 
    cleanedParams.max || 
    cleanedParams.sort
  );
  const activeCategory = categories.find((category) => category.slug === cleanedParams.category);

  // Get active filter count
  const filterCount = [
    cleanedParams.q, 
    cleanedParams.category, 
    cleanedParams.brand, 
    cleanedParams.min, 
    cleanedParams.max, 
    cleanedParams.sort
  ].filter(Boolean).length;

  return (
    <div className="container pb-24 pt-4 md:py-8">
      {/* Header */}
      <div className="mb-4 border-y bg-secondary px-4 py-5 text-secondary-foreground shadow-sm sm:rounded-lg sm:border md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
              <Sparkles className="h-4 w-4" /> Marketplace
            </p>
            <h1 className="text-2xl font-black tracking-normal sm:text-3xl">Shop products</h1>
            <p className="mt-1 text-sm text-white/70">
              Browse verified products with quick filters for category, brand and budget.
            </p>
          </div>
          <div className="rounded-md bg-white/10 px-3 py-2 text-sm font-bold">
            {products.length} {products.length === 1 ? "item" : "items"}
          </div>
        </div>
      </div>

      {/* Category Strip - Improved for mobile */}
      <div className="mb-4 overflow-x-auto border-y bg-card shadow-sm sm:rounded-lg sm:border">
        <div className="flex min-w-max gap-2 px-2 py-2">
          <Link 
            href="/shop" 
            className={`rounded-md px-3 py-2 text-xs font-bold transition whitespace-nowrap ${
              !cleanedParams.category 
                ? "bg-primary text-primary-foreground" 
                : "border bg-background hover:border-primary hover:text-primary"
            }`}
          >
            All products
          </Link>
          {categories.slice(0, 8).map((category) => (
            <Link 
              key={category.id} 
              href={`/shop?category=${category.slug}`} 
              className={`rounded-md px-3 py-2 text-xs font-bold transition whitespace-nowrap ${
                cleanedParams.category === category.slug 
                  ? "bg-primary text-primary-foreground" 
                  : "border bg-background hover:border-primary hover:text-primary"
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Filter Toggle - Improved */}
      <div className="sticky top-[61px] z-30 -mx-4 mb-3 border-y bg-card px-4 py-2 shadow-sm lg:hidden">
        <details className="group">
          <summary className="flex h-10 cursor-pointer items-center justify-between rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary/90">
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filter and sort
              {filterCount > 0 && (
                <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                  {filterCount}
                </span>
              )}
            </span>
            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>
          
          {/* Mobile Filter Panel */}
          <div className="mt-2 max-h-[70vh] overflow-y-auto rounded-lg border bg-card p-4 shadow-lg">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="inline-flex items-center gap-2 font-bold">
                <Filter className="h-4 w-4 text-primary" />
                Filters
              </h2>
              {hasFilters && (
                <Link 
                  href="/shop" 
                  className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground transition hover:text-primary"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Clear all
                </Link>
              )}
            </div>
            
            <form action="/shop" method="GET" className="grid gap-4">
              {/* Search - Mobile */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                  <Search className="h-3.5 w-3.5" />
                  Search products
                </label>
                <div className="flex h-10 items-center rounded-md border bg-background px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
                  <input 
                    name="q" 
                    defaultValue={cleanedParams.q} 
                    placeholder="Product or keyword" 
                    className="min-w-0 flex-1 bg-transparent px-2 text-sm font-normal text-foreground outline-none" 
                  />
                  {cleanedParams.q && (
                    <button 
                      type="button" 
                      onClick={() => {
                        const input = document.querySelector('input[name="q"]') as HTMLInputElement;
                        if (input) input.value = '';
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category - Mobile */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                  <Tag className="h-3.5 w-3.5" />
                  Category
                </label>
                <select 
                  name="category" 
                  defaultValue={cleanedParams.category ?? ""} 
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm font-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 10px center',
                    paddingRight: '30px'
                  }}
                >
                  <option value="">All categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>{category.name}</option>
                  ))}
                </select>
              </div>

              {/* Brand - Mobile */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  Brand
                </label>
                <input 
                  name="brand" 
                  defaultValue={cleanedParams.brand} 
                  placeholder="Any brand" 
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm font-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" 
                />
              </div>

              {/* Price Range - Mobile - Fixed */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5" />
                  Price range (₹)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input 
                      name="min" 
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={cleanedParams.min} 
                      placeholder="Min" 
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm font-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                    />
                  </div>
                  <div>
                    <input 
                      name="max" 
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={cleanedParams.max} 
                      placeholder="Max" 
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm font-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                    />
                  </div>
                </div>
                {(cleanedParams.min || cleanedParams.max) && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    Range: {cleanedParams.min ? `₹${Number(cleanedParams.min).toLocaleString()}` : '₹0'} - {cleanedParams.max ? `₹${Number(cleanedParams.max).toLocaleString()}` : 'Any'}
                  </div>
                )}
              </div>

              {/* Sort - Mobile */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                  <SortAsc className="h-3.5 w-3.5" />
                  Sort by
                </label>
                <select 
                  name="sort" 
                  defaultValue={cleanedParams.sort ?? ""} 
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm font-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 10px center',
                    paddingRight: '30px'
                  }}
                >
                  <option value="">Newest first</option>
                  <option value="rating">Top rated</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="submit" 
                  className="flex-1 h-10 rounded-md bg-primary text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary/90"
                >
                  Apply filters
                </button>
                {hasFilters && (
                  <Link 
                    href="/shop" 
                    className="flex h-10 items-center justify-center rounded-md border px-4 text-sm font-semibold transition hover:bg-muted"
                  >
                    Reset
                  </Link>
                )}
              </div>
            </form>
          </div>
        </details>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 lg:grid-cols-[270px_1fr]">
        {/* Desktop Filters */}
        <aside id="filters" className="scroll-mt-32 hidden h-fit rounded-lg border bg-card p-4 shadow-sm lg:sticky lg:top-28 lg:block">
          <div className="flex items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 font-bold">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Filters
            </h2>
            {hasFilters && (
              <Link 
                href="/shop" 
                className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground transition hover:text-primary"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Clear all
              </Link>
            )}
          </div>

          {/* Active Filters Display - Desktop */}
          {hasFilters && (
            <div className="mt-3 flex flex-wrap gap-1.5 border-t pt-3">
              {cleanedParams.q && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs">
                  Search: {cleanedParams.q}
                  <Link href="/shop" className="ml-1 hover:text-primary">×</Link>
                </span>
              )}
              {cleanedParams.category && activeCategory && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs">
                  {activeCategory.name}
                  <Link href="/shop" className="ml-1 hover:text-primary">×</Link>
                </span>
              )}
              {cleanedParams.brand && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs">
                  Brand: {cleanedParams.brand}
                  <Link href="/shop" className="ml-1 hover:text-primary">×</Link>
                </span>
              )}
              {(cleanedParams.min || cleanedParams.max) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs">
                  ₹{cleanedParams.min || '0'} - ₹{cleanedParams.max || '∞'}
                  <Link href="/shop" className="ml-1 hover:text-primary">×</Link>
                </span>
              )}
            </div>
          )}

          <form action="/shop" method="GET" className="mt-4 grid gap-3">
            {/* Search - Desktop */}
            <label className="grid gap-1.5 text-xs font-bold text-muted-foreground">
              Search
              <span className="flex h-10 items-center rounded-md border bg-background px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input 
                  name="q" 
                  defaultValue={cleanedParams.q} 
                  placeholder="Product or keyword" 
                  className="min-w-0 flex-1 bg-transparent px-2 text-sm font-normal text-foreground outline-none" 
                />
              </span>
            </label>

            {/* Category - Desktop */}
            <label className="grid gap-1.5 text-xs font-bold text-muted-foreground">
              Category
              <select 
                name="category" 
                defaultValue={cleanedParams.category ?? ""} 
                className="h-10 rounded-md border bg-background px-3 text-sm font-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>{category.name}</option>
                ))}
              </select>
            </label>

            {/* Brand - Desktop */}
            <label className="grid gap-1.5 text-xs font-bold text-muted-foreground">
              Brand
              <input 
                name="brand" 
                defaultValue={cleanedParams.brand} 
                placeholder="Any brand" 
                className="h-10 rounded-md border bg-background px-3 text-sm font-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" 
              />
            </label>

            {/* Price Range - Desktop - Fixed */}
            <div className="grid gap-1.5">
              <span className="text-xs font-bold text-muted-foreground">Price range (₹)</span>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  name="min" 
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={cleanedParams.min} 
                  placeholder="Min" 
                  className="h-10 rounded-md border bg-background px-3 text-sm font-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                />
                <input 
                  name="max" 
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={cleanedParams.max} 
                  placeholder="Max" 
                  className="h-10 rounded-md border bg-background px-3 text-sm font-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                />
              </div>
              {(cleanedParams.min || cleanedParams.max) && (
                <div className="text-xs text-muted-foreground">
                  Range: {cleanedParams.min ? `₹${Number(cleanedParams.min).toLocaleString()}` : '₹0'} - {cleanedParams.max ? `₹${Number(cleanedParams.max).toLocaleString()}` : 'Any'}
                </div>
              )}
            </div>

            {/* Sort - Desktop */}
            <label className="grid gap-1.5 text-xs font-bold text-muted-foreground">
              Sort by
              <select 
                name="sort" 
                defaultValue={cleanedParams.sort ?? ""} 
                className="h-10 rounded-md border bg-background px-3 text-sm font-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                <option value="">Newest first</option>
                <option value="rating">Top rated</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </label>

            <button 
              type="submit" 
              className="h-10 rounded-md bg-primary text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary/90"
            >
              Apply filters
            </button>
          </form>
        </aside>

        {/* Products Grid */}
        <div id="products" className="scroll-mt-32">
          <div className="mb-3 flex min-h-10 flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-black">
                {activeCategory?.name ?? (cleanedParams.q ? `Results for "${cleanedParams.q}"` : "All products")}
              </h2>
              <p className="text-xs text-muted-foreground">
                Showing {products.length} available {products.length === 1 ? "item" : "items"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {hasFilters && (
                <Link 
                  href="/shop" 
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary transition hover:gap-2"
                >
                  Reset <RotateCcw className="h-3 w-3" />
                </Link>
              )}
              {/* View toggle - Optional */}
              <div className="hidden sm:flex rounded-md border">
                <button className="p-1.5 px-2 bg-primary/10 text-primary">
                  <Grid3x3 className="h-4 w-4" />
                </button>
                <button className="p-1.5 px-2 hover:bg-muted text-muted-foreground">
                  <LayoutList className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-bold">No products match these filters.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a wider price range or clear the current search.
              </p>
              <Link 
                href="/shop" 
                className="mt-4 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <div key={product.id} className="transition hover:scale-95">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
