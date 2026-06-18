import { ProductCard } from "@/components/product-card";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function WishlistPage() {
  const user = await requireUser();
  const items = await prisma.wishlist.findMany({ where: { userId: user.id }, include: { product: true } });
  return (
    <div className="container py-10">
      <h1 className="text-4xl font-black tracking-normal">Wishlist</h1>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => <ProductCard key={item.id} product={item.product} initialWishlisted />)}
      </div>
      {!items.length ? <div className="mt-8 rounded-lg border bg-card p-10 text-center text-muted-foreground">Saved products will appear here.</div> : null}
    </div>
  );
}
