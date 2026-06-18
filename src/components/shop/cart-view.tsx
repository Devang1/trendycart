"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

export function CartView() {
  const router = useRouter();
  const { status } = useSession();
  const { items, removeItem, setQuantity } = useCartStore();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = items.length ? 500 : 0;
  const total = subtotal + shipping;

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-black tracking-normal">Shopping cart</h1>
      {items.length === 0 ? (
        <div className="mt-8 rounded-lg border bg-card p-10 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Button asChild className="mt-4"><Link href="/shop">Continue shopping</Link></Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-4">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-[96px_1fr] gap-4 rounded-lg border bg-card p-4">
                <div className="relative aspect-square overflow-hidden rounded-md bg-muted"><Image src={item.image} alt={item.name} fill className="object-cover" /></div>
                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <div>
                    <Link href={`/product/${item.slug}`} className="font-bold">{item.name}</Link>
                    <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" min={1} max={item.stock} value={item.quantity} onChange={(event) => setQuantity(item.id, Number(event.target.value))} className="h-10 w-20 rounded-md border bg-background px-2" />
                    <Button variant="outline" onClick={() => removeItem(item.id)}>Remove</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <aside className="h-fit rounded-lg border bg-card p-5">
            <h2 className="text-xl font-black tracking-normal">Cart summary</h2>
            <div className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(shipping)}</span></div>
              <div className="flex justify-between border-t pt-3 text-lg font-black"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>
            <Button
              className="mt-5 w-full"
              size="lg"
              disabled={status === "loading"}
              onClick={() => {
                if (status !== "authenticated") {
                  toast.error("Please login to checkout");
                  router.push(`/login?callbackUrl=${encodeURIComponent("/checkout")}`);
                  return;
                }

                router.push("/checkout");
              }}
            >
              Checkout
            </Button>
          </aside>
        </div>
      )}
    </div>
  );
}
