import { OrderStatus, PaymentStatus, Role } from "@prisma/client";
import { format } from "date-fns";
import { approveSeller, createAdminCategory, createAdminCoupon, createAdminProduct, deleteAdminProduct, toggleAdminCoupon, updateAdminOrder, updateAdminProduct, updateAdminUserRole } from "@/actions/marketplace";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { formatPrice } from "@/lib/utils";
import type React from "react";

const fulfillmentStatuses = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Packed" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" }
] satisfies Array<{ value: OrderStatus; label: string }>;

export default async function AdminDashboardPage() {
  await requireRole(["ADMIN"]);
  const currentYear = new Date().getFullYear();
  const chartStart = new Date(currentYear, 0, 1);
  const [userCount, sellerCount, productCount, orderCount, revenue, sellers, categories, products, pendingSellers, recentOrders, recentUsers, chartOrders, coupons] = await Promise.all([
    prisma.user.count(),
    prisma.seller.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
    prisma.seller.findMany({ orderBy: { storeName: "asc" }, include: { user: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      take: 12,
      orderBy: { createdAt: "desc" },
      include: { category: true, categories: true, seller: true }
    }),
    prisma.seller.findMany({
      where: { approvalStatus: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: { user: true }
    }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { user: true }
    }),
    prisma.user.findMany({
      take: 6,
      orderBy: { createdAt: "desc" }
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: chartStart } },
      select: { createdAt: true, totalAmount: true }
    }),
    prisma.coupon.findMany({
      take: 8,
      orderBy: { expiryDate: "asc" }
    })
  ]);
  const chartData = buildMonthlyRevenueData(chartOrders);

  return (
    <div className="container py-10">
      <div className="rounded-lg bg-secondary p-8 text-secondary-foreground">
        <p className="text-sm font-bold uppercase text-primary">Admin portal</p>
        <h1 className="mt-2 text-4xl font-black tracking-normal">Manage TrendyCart</h1>
        <p className="mt-2 max-w-2xl text-sm opacity-80">Create catalog items, approve sellers, monitor orders, and keep the storefront fresh.</p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-5">
        <StatCard title="Revenue" value={formatPrice(Number(revenue._sum.totalAmount ?? 0))} hint="Platform GMV" />
        <StatCard title="Users" value={String(userCount)} hint="Registered accounts" />
        <StatCard title="Sellers" value={String(sellerCount)} hint="Marketplace stores" />
        <StatCard title="Products" value={String(productCount)} hint="Catalog items" />
        <StatCard title="Orders" value={String(orderCount)} hint="All-time orders" />
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-lg border bg-card p-5">
          <h2 className="text-xl font-black tracking-normal">Add product</h2>
          <form action={createAdminProduct} className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Product name" name="name" placeholder="AeroFlex Running Sneakers" />
            <Field label="Brand" name="brand" placeholder="StrideCloud" />
            <label className="grid gap-2 text-sm font-medium">
              Seller
              <select name="sellerId" required className="h-11 rounded-md border border-input bg-background px-3 text-sm">
                {sellers.map((seller) => (
                  <option key={seller.id} value={seller.id}>{seller.storeName}</option>
                ))}
              </select>
            </label>
            <CategoryMultiSelect categories={categories} selectedIds={[]} className="md:col-span-2" />
            <Field label="Price" name="price" type="number" min="1" placeholder="5299" />
            <Field label="Discount price" name="discountPrice" type="number" min="1" placeholder="4299" />
            <Field label="Stock" name="stock" type="number" min="0" placeholder="48" />
            <ImageUploadField label="Product images" name="images" folder="trendycart/products" multiple />
            <label className="grid gap-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <textarea id="description" name="description" required minLength={20} className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Describe the product clearly for shoppers." />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input name="approved" type="checkbox" defaultChecked /> Approved
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input name="featured" type="checkbox" defaultChecked /> Featured
            </label>
            <Button className="md:col-span-2">Create product</Button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-5">
            <h2 className="text-xl font-black tracking-normal">Add category</h2>
            <form action={createAdminCategory} className="mt-5 grid gap-4">
              <Field label="Category name" name="name" placeholder="Watches" />
              <ImageUploadField label="Category image" name="image" folder="trendycart/categories" />
              <Button>Create category</Button>
            </form>
          </div>

          <div className="rounded-lg border bg-card p-5">
            <h2 className="text-xl font-black tracking-normal">Create coupon</h2>
            <form action={createAdminCoupon} className="mt-5 grid gap-4">
              <Field label="Code" name="code" placeholder="WELCOME10" />
              <Field label="Discount" name="discount" type="number" min="1" placeholder="10" />
              <Field label="Minimum amount" name="minAmount" type="number" min="0" placeholder="999" />
              <Field label="Usage limit" name="usageLimit" type="number" min="1" placeholder="100" />
              <Field label="Expiry date" name="expiryDate" type="date" />
              <label className="flex items-center gap-2 text-sm font-medium">
                <input name="isPercentage" type="checkbox" defaultChecked /> Percentage discount
              </label>
              <Button>Create coupon</Button>
            </form>
          </div>

          <div className="rounded-lg border bg-card p-5">
            <h2 className="text-xl font-black tracking-normal">Seller approvals</h2>
            <div className="mt-4 space-y-3">
              {pendingSellers.length === 0 ? <p className="text-sm text-muted-foreground">No sellers waiting for approval.</p> : null}
              {pendingSellers.map((seller) => (
                <div key={seller.id} className="flex items-center justify-between gap-3 rounded-md bg-muted p-3">
                  <div>
                    <p className="font-bold">{seller.storeName}</p>
                    <p className="text-xs text-muted-foreground">{seller.user.email}</p>
                  </div>
                  <form action={approveSeller.bind(null, seller.id)}>
                    <Button size="sm">Approve</Button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-lg border bg-card p-5">
        <h2 className="text-xl font-black tracking-normal">Product management</h2>
        <div className="mt-5 grid gap-4">
          {products.map((product) => (
            <div key={product.id} className="rounded-lg border bg-background p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-black">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.brand} / {getCategoryNames(product)} / {product.seller.storeName}</p>
                </div>
                <form action={deleteAdminProduct}>
                  <input type="hidden" name="productId" value={product.id} />
                  <Button variant="destructive" size="sm">Delete</Button>
                </form>
              </div>
              <form action={updateAdminProduct} className="mt-4 grid gap-3 md:grid-cols-6 md:items-end">
                <input type="hidden" name="productId" value={product.id} />
                <Field label="Price" name="price" type="number" min="1" defaultValue={String(product.price)} />
                <Field label="Discount" name="discountPrice" type="number" min="1" defaultValue={product.discountPrice ? String(product.discountPrice) : ""} />
                <Field label="Stock" name="stock" type="number" min="0" defaultValue={String(product.stock)} />
                <CategoryMultiSelect categories={categories} selectedIds={(product.categories.length ? product.categories : [product.category]).map((category) => category.id)} className="md:col-span-3" />
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input name="approved" type="checkbox" defaultChecked={product.approved} /> Approved
                </label>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input name="featured" type="checkbox" defaultChecked={product.featured} /> Featured
                </label>
                <Button size="sm">Save</Button>
              </form>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-lg border bg-card p-5">
        <h2 className="text-xl font-black tracking-normal">Revenue reports</h2>
        <p className="mt-1 text-sm text-muted-foreground">Actual monthly revenue and order count from this year&apos;s orders.</p>
        <RevenueChart data={chartData} />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="rounded-lg border bg-card p-5">
          <h2 className="text-xl font-black tracking-normal">Order management</h2>
          <div className="mt-4 space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="rounded-md bg-muted p-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="font-bold">{order.orderNumber}</span>
                  <span>{formatPrice(Number(order.totalAmount))}</span>
                </div>
                <p className="mt-1 text-muted-foreground">{order.user.email}</p>
                <form action={updateAdminOrder} className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-end">
                  <input type="hidden" name="orderId" value={order.id} />
                  <StatusPicker defaultValue={order.orderStatus} />
                  <SelectField label="Payment" name="paymentStatus" defaultValue={order.paymentStatus} values={Object.values(PaymentStatus)} />
                  <Field label="Tracking" name="trackingNumber" defaultValue={order.trackingNumber ?? ""} placeholder="AWB / tracking ID" />
                  <Field label="Expected delivery" name="expectedDeliveryDate" type="date" defaultValue={order.expectedDeliveryDate ? format(order.expectedDeliveryDate, "yyyy-MM-dd") : ""} />
                  <label className="grid gap-2 md:col-span-2 lg:col-span-4">
                    <Label htmlFor={`deliveryRemark-${order.id}`}>Remark</Label>
                    <textarea id={`deliveryRemark-${order.id}`} name="deliveryRemark" defaultValue={order.deliveryRemark ?? ""} className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Customer-visible delivery note" />
                  </label>
                  <Button size="sm">Update</Button>
                </form>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <h2 className="text-xl font-black tracking-normal">User roles</h2>
          <div className="mt-4 space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="rounded-md bg-muted p-3 text-sm">
                <p className="font-bold">{user.email}</p>
                <form action={updateAdminUserRole} className="mt-3 flex gap-2">
                  <input type="hidden" name="userId" value={user.id} />
                  <select name="role" defaultValue={user.role} className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm">
                    {Object.values(Role).map((role) => <option key={role} value={role}>{role}</option>)}
                  </select>
                  <Button size="sm">Save</Button>
                </form>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-lg border bg-card p-5">
        <h2 className="text-xl font-black tracking-normal">Coupons</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {coupons.length === 0 ? <p className="text-sm text-muted-foreground">No coupons created yet.</p> : null}
          {coupons.map((coupon) => (
            <form key={coupon.id} action={toggleAdminCoupon} className="rounded-md bg-muted p-3 text-sm">
              <input type="hidden" name="couponId" value={coupon.id} />
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-black">{coupon.code}</p>
                  <p className="text-muted-foreground">
                    {Number(coupon.discount)}{coupon.isPercentage ? "%" : " off"} / Used {coupon.usedCount}
                  </p>
                </div>
                <label className="flex items-center gap-2 font-medium">
                  <input name="active" type="checkbox" defaultChecked={coupon.active} /> Active
                </label>
              </div>
              <Button size="sm" className="mt-3">Update coupon</Button>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  const id = String(props.name);
  return (
    <label className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...props} />
    </label>
  );
}

function SelectField({ label, values, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; name: string; values: string[] }) {
  const id = String(props.name);
  return (
    <label className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <select id={id} {...props} className="h-11 rounded-md border border-input bg-background px-3 text-sm">
        {values.map((value) => <option key={value} value={value}>{value}</option>)}
      </select>
    </label>
  );
}

function CategoryMultiSelect({
  categories,
  selectedIds,
  className
}: {
  categories: Array<{ id: string; name: string }>;
  selectedIds: string[];
  className?: string;
}) {
  return (
    <label className={`grid gap-2 text-sm font-medium ${className ?? ""}`}>
      Categories
      <select name="categoryIds" multiple required defaultValue={selectedIds} className="min-h-28 rounded-md border border-input bg-background px-3 py-2 text-sm">
        {categories.map((category) => (
          <option key={category.id} value={category.id}>{category.name}</option>
        ))}
      </select>
    </label>
  );
}

function getCategoryNames(product: { category: { name: string }; categories: Array<{ name: string }> }) {
  const names = product.categories.length ? product.categories.map((category) => category.name) : [product.category.name];
  return names.join(", ");
}

function StatusPicker({ defaultValue }: { defaultValue: OrderStatus }) {
  return (
    <fieldset className="grid gap-2 md:col-span-2 lg:col-span-5">
      <legend className="text-sm font-medium">Fulfillment status</legend>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
        {fulfillmentStatuses.map((status) => (
          <label key={status.value} className="relative">
            <input className="peer sr-only" type="radio" name="orderStatus" value={status.value} defaultChecked={defaultValue === status.value} />
            <span className="flex h-10 items-center justify-center rounded-md border bg-background px-2 text-xs font-bold transition peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground">
              {status.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function buildMonthlyRevenueData(orders: Array<{ createdAt: Date; totalAmount: unknown }>) {
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const data = labels.map((name) => ({ name, revenue: 0, orders: 0 }));

  for (const order of orders) {
    const month = order.createdAt.getMonth();
    data[month].revenue += Number(order.totalAmount);
    data[month].orders += 1;
  }

  return data;
}
