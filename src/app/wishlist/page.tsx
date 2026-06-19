import { ProductCard } from "@/components/product-card";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function WishlistPage() {
  const user = await requireUser();
  const items = await prisma.wishlist.findMany({ 
    where: { userId: user.id }, 
    include: { product: true },
    orderBy: { createdAt: 'desc' }
  });

  async function removeFromWishlist(formData: FormData) {
    "use server";
    const itemId = formData.get("itemId") as string;
    await prisma.wishlist.delete({ where: { id: itemId } });
    revalidatePath("/wishlist");
  }

  async function clearWishlist() {
    "use server";
    await prisma.wishlist.deleteMany({ where: { userId: user.id } });
    revalidatePath("/wishlist");
  }

  return (
    <div className="container py-6 md:py-10">
      {/* Header with interactive elements */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 text-primary fill-primary" />
          <h1 className="text-3xl md:text-4xl font-black tracking-normal">Wishlist</h1>
          <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {items.length}
          </span>
        </div>
        
        {items.length > 0 && (
          <form action={clearWishlist}>
            <button
              type="submit"
              className="text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </button>
          </form>
        )}
      </div>

      {/* Product Grid - 2 columns on mobile, responsive breakpoints */}
      <div className="mt-6 md:mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="group relative">
            <ProductCard product={item.product} initialWishlisted />
            
            {/* Quick remove button on hover */}
            <form action={removeFromWishlist} className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <input type="hidden" name="itemId" value={item.id} />
              <button
                type="submit"
                className="bg-background/80 backdrop-blur-sm p-1.5 rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors shadow-sm"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </button>
            </form>

            {/* Added date indicator */}
            <div className="absolute bottom-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] md:text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
                Added {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State with interactive elements */}
      {!items.length && (
        <div className="mt-8 md:mt-12 rounded-lg border bg-card p-8 md:p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Heart className="h-16 w-16 text-muted-foreground/30" />
            <div>
              <h3 className="text-lg font-semibold">Your wishlist is empty</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Saved products will appear here. Start exploring and save your favorites!
              </p>
            </div>
            <a
              href="/shop"
              className="inline-flex items-center gap-2 mt-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
            >
              <ShoppingBag className="h-4 w-4" />
              Browse Products
            </a>
          </div>
        </div>
      )}

      {/* Quick actions bar when items exist */}
      {items.length > 0 && (
        <div className="mt-6 md:mt-8 flex justify-center">
          <a
            href="/products"
            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
          </a>
        </div>
      )}
    </div>
  );
}