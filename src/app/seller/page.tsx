import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { formatPrice } from "@/lib/utils";

export default async function SellerDashboardPage() {
  const user = await requireRole(["SELLER", "ADMIN"]);
  const seller = await prisma.seller.findUnique({ where: { userId: user.id }, include: { products: true, withdrawals: true } });
  const sellerProductIds = seller?.products.map((product) => product.id) ?? [];
  const orderItems = await prisma.orderItem.findMany({ where: { productId: { in: sellerProductIds } }, include: { order: true, product: true } });
  const revenue = orderItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-black tracking-normal">Seller dashboard</h1>
      <p className="mt-2 text-muted-foreground">{seller?.storeName ?? "Seller registration pending"} / {seller?.approvalStatus ?? "PENDING"}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard title="Revenue" value={formatPrice(revenue)} hint="Gross seller sales" />
        <StatCard title="Products" value={String(seller?.products.length ?? 0)} hint="Listed catalog items" />
        <StatCard title="Orders" value={String(orderItems.length)} hint="Items sold" />
        <StatCard title="Withdrawals" value={String(seller?.withdrawals.length ?? 0)} hint="Payout requests" />
      </div>
      <section className="mt-8 rounded-lg border bg-card p-5">
        <h2 className="text-xl font-black tracking-normal">Sales analytics</h2>
        <RevenueChart data={[
          { name: "Mon", revenue: revenue * 0.1, orders: 4 },
          { name: "Tue", revenue: revenue * 0.15, orders: 6 },
          { name: "Wed", revenue: revenue * 0.18, orders: 8 },
          { name: "Thu", revenue: revenue * 0.12, orders: 5 },
          { name: "Fri", revenue: revenue * 0.2, orders: 9 },
          { name: "Sat", revenue: revenue * 0.25, orders: 11 }
        ]} />
      </section>
      <section className="mt-8 rounded-lg border bg-card p-5">
        <h2 className="text-xl font-black tracking-normal">Inventory</h2>
        <div className="mt-4 grid gap-3">
          {seller?.products.map((product) => <p key={product.id} className="flex justify-between rounded-md bg-muted p-3"><span>{product.name}</span><span>{product.stock} left</span></p>)}
        </div>
      </section>
    </div>
  );
}
