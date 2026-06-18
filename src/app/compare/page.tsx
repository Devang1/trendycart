import { ProductCard } from "@/components/product-card";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function ComparePage() {
  const user = await requireUser();
  const items = await prisma.productComparison.findMany({ where: { userId: user.id }, include: { product: true } });
  return (
    <div className="container py-10">
      <h1 className="text-4xl font-black tracking-normal">Product comparison</h1>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {items.map((item) => <ProductCard key={item.id} product={item.product} />)}
      </div>
      {!items.length ? <div className="mt-8 rounded-lg border bg-card p-10 text-center text-muted-foreground">Add products to compare specifications, prices, ratings, and sellers.</div> : null}
    </div>
  );
}
