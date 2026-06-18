import { format, addDays } from "date-fns";
import { CheckCircle2, Clock3, Copy, MapPin, MessageSquareText, PackageCheck, Search, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

const orderSteps = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

const stepLabels: Record<(typeof orderSteps)[number], string> = {
  PENDING: "Placed",
  CONFIRMED: "Confirmed",
  PROCESSING: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered"
};

export default async function OrdersPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const query = params.q?.trim();
  const orders = await prisma.order.findMany({
    where: {
      userId: user.id,
      orderNumber: query ? { contains: query, mode: "insensitive" } : undefined
    },
    include: { items: { include: { product: true } }, statusTimeline: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="container pb-24 pt-5 md:py-8">
      <div className="rounded-lg border bg-card p-4 shadow-sm md:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_380px] lg:items-end">
          <div>
            <p className="text-sm font-bold text-primary">Track orders</p>
            <h1 className="text-2xl font-black tracking-normal sm:text-3xl">Your orders</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Check payment status, delivery progress, tracking details and item history in one place.
            </p>
          </div>
          <form action="/orders" className="flex h-11 items-center rounded-md border bg-background px-3 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input name="q" defaultValue={query} placeholder="Search order ID" className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none" />
            <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">Track</button>
          </form>
        </div>
      </div>

      <div className="mt-4 grid gap-4">
        {orders.map((order) => {
          const currentStep = getCurrentStep(order.orderStatus);
          const isClosed = order.orderStatus === "CANCELLED" || order.orderStatus === "REFUNDED";
          const latestUpdate = order.statusTimeline.at(-1);
          const address = getAddressLine(order.shippingAddress);
          const expectedDeliveryDate = order.expectedDeliveryDate ?? addDays(order.createdAt, 5);

          return (
            <article key={order.id} className="overflow-hidden rounded-lg border bg-card shadow-sm">
              <div className="grid gap-4 border-b p-4 md:grid-cols-[1fr_auto] md:p-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-black">{order.orderNumber}</p>
                    <span className={statusBadgeClass(order.orderStatus)}>
                      {formatStatus(order.orderStatus)}
                    </span>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">
                      {formatStatus(order.paymentStatus)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Placed on {format(order.createdAt, "PPp")}</p>
                </div>
                <div className="md:text-right">
                  <p className="text-xl font-black">{formatPrice(Number(order.totalAmount))}</p>
                  <p className="text-xs font-bold text-muted-foreground">{order.items.length} {order.items.length === 1 ? "item" : "items"}</p>
                </div>
              </div>

              <div className="grid gap-4 p-4 lg:grid-cols-[1fr_300px] lg:p-5">
                <div className="grid gap-4">
                  <div className="rounded-lg bg-muted p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold">{isClosed ? "Order closed" : getTrackingTitle(order.orderStatus)}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {order.deliveryRemark ?? latestUpdate?.note ?? "We will update this timeline as the order moves."}
                        </p>
                      </div>
                      <Truck className="h-5 w-5 shrink-0 text-primary" />
                    </div>

                    <div className="grid grid-cols-5 gap-1">
                      {orderSteps.map((step, index) => {
                        const active = !isClosed && index <= currentStep;
                        return (
                          <div key={step} className="min-w-0">
                            <div className={`h-1.5 rounded-full ${active ? "bg-primary" : "bg-border"}`} />
                            <p className={`mt-2 truncate text-[11px] font-bold ${active ? "text-primary" : "text-muted-foreground"}`}>
                              {stepLabels[step]}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    {order.items.map((item) => (
                      <Link key={item.id} href={`/product/${item.product.slug}`} className="grid grid-cols-[56px_1fr_auto] items-center gap-3 rounded-lg border bg-background p-2 transition hover:border-primary">
                        <div className="relative h-14 w-14 overflow-hidden rounded-md bg-muted">
                          <Image src={item.product.images[0] ?? "/discover.png"} alt={item.product.name} fill sizes="56px" className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-1 text-sm font-bold">{item.product.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">Qty {item.quantity} x {formatPrice(Number(item.price))}</p>
                        </div>
                        <p className="text-sm font-black">{formatPrice(Number(item.price) * item.quantity)}</p>
                      </Link>
                    ))}
                  </div>
                </div>

                <aside className="grid gap-3">
                  <InfoTile icon={PackageCheck} title="Expected delivery" text={isClosed ? formatStatus(order.orderStatus) : format(expectedDeliveryDate, "PP")} />
                  <InfoTile icon={Copy} title="Tracking number" text={order.trackingNumber ?? "Assigned after shipping"} />
                  <InfoTile icon={MessageSquareText} title="Remark" text={order.deliveryRemark ?? "No delivery remark yet"} />
                  <InfoTile icon={MapPin} title="Delivering to" text={address || "Shipping address saved"} />
                  <div className="rounded-lg border bg-background p-3">
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-primary" />
                      <p className="text-sm font-bold">Timeline</p>
                    </div>
                    <div className="mt-3 grid gap-2">
                      {order.statusTimeline.length ? (
                        order.statusTimeline.map((entry) => (
                          <div key={entry.id} className="grid grid-cols-[18px_1fr] gap-2 text-sm">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                            <div>
                              <p className="font-bold">{formatStatus(entry.status)}</p>
                              <p className="text-xs text-muted-foreground">{entry.note ?? "Updated"} - {format(entry.createdAt, "PPp")}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No timeline updates yet.</p>
                      )}
                    </div>
                  </div>
                </aside>
              </div>
            </article>
          );
        })}
        {!orders.length ? (
          <div className="rounded-lg border bg-card p-8 text-center shadow-sm">
            <PackageCheck className="mx-auto h-8 w-8 text-primary" />
            <p className="mt-3 font-bold">{query ? "No matching order found." : "No orders yet."}</p>
            <p className="mt-1 text-sm text-muted-foreground">{query ? "Check the order ID and try again." : "Shop products and track every update here."}</p>
            <Link href="/shop" className="mt-4 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground">
              Start shopping
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InfoTile({ icon: Icon, title, text }: { icon: typeof PackageCheck; title: string; text: string }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-2 text-sm font-bold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{text}</p>
    </div>
  );
}

function getCurrentStep(status: string) {
  const index = orderSteps.findIndex((step) => step === status);
  return index >= 0 ? index : 0;
}

function getTrackingTitle(status: string) {
  if (status === "DELIVERED") return "Delivered successfully";
  if (status === "SHIPPED") return "On the way";
  if (status === "PROCESSING") return "Packing your order";
  if (status === "CONFIRMED") return "Order confirmed";
  return "Order placed";
}

function formatStatus(status: string) {
  return status.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusBadgeClass(status: string) {
  if (status === "DELIVERED") return "rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground";
  if (status === "CANCELLED" || status === "REFUNDED") return "rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground";
  return "rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground";
}

function getAddressLine(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const address = value as Record<string, unknown>;
  return [address.address, address.city, address.state, address.pincode]
    .filter((part): part is string => typeof part === "string" && part.length > 0)
    .join(", ");
}
