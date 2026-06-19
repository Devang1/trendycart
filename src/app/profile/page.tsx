import Link from "next/link";
import { Bell, ChevronRight, Gift, Heart, MapPin, Package, ShieldCheck, UserRound, Wallet } from "lucide-react";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      addresses: { orderBy: { isDefault: "desc" } },
      notifications: { take: 5, orderBy: { createdAt: "desc" } },
      orders: { take: 3, orderBy: { createdAt: "desc" } },
      _count: { select: { orders: true, wishlist: true } }
    }
  });

  return (
    <div className="container pb-24 pt-5 md:py-8">
      <section className="border-y bg-secondary p-5 text-secondary-foreground shadow-sm sm:rounded-lg sm:border md:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-black text-primary-foreground">
              {(profile?.name ?? profile?.email ?? "U").charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="text-sm font-semibold text-accent">My account</p>
              <h1 className="text-2xl font-black tracking-normal sm:text-3xl">{profile?.name ?? "TrendyCart shopper"}</h1>
              <p className="text-sm text-white/70">{profile?.email}</p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-xs font-bold">
            <ShieldCheck className="h-4 w-4 text-primary" /> {profile?.role.toLowerCase()} account
          </span>
        </div>
      </section>

      <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {[
          { label: "Orders", value: profile?._count.orders ?? 0, icon: Package, href: "/orders" },
          { label: "Wishlist", value: profile?._count.wishlist ?? 0, icon: Heart, href: "/wishlist" },
          { label: "Reward points", value: profile?.rewardPoints ?? 0, icon: Gift, href: "/shop" },
          { label: "Wallet", value: formatPrice(Number(profile?.walletBalance ?? 0)), icon: Wallet, href: "/checkout" }
        ].map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="flex items-center gap-3 border bg-card p-3 shadow-sm transition hover:border-primary/40 hover:shadow-md sm:rounded-lg">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
            <span><span className="block text-lg font-black">{value}</span><span className="block text-xs text-muted-foreground">{label}</span></span>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
        <section className="border bg-card p-4 shadow-sm sm:rounded-lg">
          <div className="flex items-center justify-between">
            <h2 className="inline-flex items-center gap-2 font-black"><Package className="h-4 w-4 text-primary" /> Recent orders</h2>
            <Link href="/orders" className="inline-flex items-center text-xs font-bold text-primary">View all <ChevronRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-3 divide-y">
            {profile?.orders.map((order) => (
              <Link key={order.id} href="/orders" className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">Order #{order.orderNumber}</span>
                  <span className="block text-xs text-muted-foreground">{order.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </span>
                <span className="text-right">
                  <span className="block text-sm font-black">{formatPrice(Number(order.totalAmount))}</span>
                  <span className="block text-[11px] font-bold text-primary">{order.orderStatus.toLowerCase()}</span>
                </span>
              </Link>
            ))}
            {!profile?.orders.length ? <EmptyState text="Your recent orders will appear here." href="/shop" label="Start shopping" /> : null}
          </div>
        </section>

        <section className="border bg-card p-4 shadow-sm sm:rounded-lg">
          <h2 className="inline-flex items-center gap-2 font-black"><UserRound className="h-4 w-4 text-primary" /> Account details</h2>
          <dl className="mt-3 grid gap-3 text-sm">
            <div><dt className="text-xs text-muted-foreground">Full name</dt><dd className="font-semibold">{profile?.name ?? "Not added"}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Email address</dt><dd className="break-all font-semibold">{profile?.email}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Member since</dt><dd className="font-semibold">{profile?.createdAt.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</dd></div>
          </dl>
        </section>

        <section className="border bg-card p-4 shadow-sm sm:rounded-lg">
          <h2 className="inline-flex items-center gap-2 font-black"><MapPin className="h-4 w-4 text-primary" /> Saved addresses</h2>
          <div className="mt-3 grid gap-2">
            {profile?.addresses.map((address) => (
              <div key={address.id} className="rounded-md border bg-background p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold">{address.fullName}</p>
                  {address.isDefault ? <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">Default</span> : null}
                </div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} {address.postalCode}</p>
              </div>
            ))}
            {!profile?.addresses.length ? <EmptyState text="Add your first address during checkout." href="/shop" label="Browse products" /> : null}
          </div>
        </section>

        <section className="border bg-card p-4 shadow-sm sm:rounded-lg">
          <h2 className="inline-flex items-center gap-2 font-black"><Bell className="h-4 w-4 text-primary" /> Notifications</h2>
          <div className="mt-3 divide-y">
            {profile?.notifications.map((notification) => (
              <div key={notification.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notification.read ? "bg-muted-foreground/30" : "bg-accent"}`} />
                <div><p className="text-sm font-bold">{notification.title}</p><p className="mt-0.5 text-xs leading-5 text-muted-foreground">{notification.message}</p></div>
              </div>
            ))}
            {!profile?.notifications.length ? <p className="py-4 text-sm text-muted-foreground">No notifications yet.</p> : null}
          </div>
        </section>
      </div>
    </div>
  );
}

function EmptyState({ text, href, label }: { text: string; href: string; label: string }) {
  return (
    <div className="py-5 text-center">
      <p className="text-sm text-muted-foreground">{text}</p>
      <Link href={href} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary">{label} <ChevronRight className="h-3.5 w-3.5" /></Link>
    </div>
  );
}
