"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function CheckoutView() {
  const router = useRouter();
  const { items, clear } = useCartStore();
  const [method, setMethod] = useState<"RAZORPAY" | "COD">("RAZORPAY");
  const [isPlacing, setIsPlacing] = useState(false);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = items.length ? 500 : 0;
  const total = subtotal + shipping;

  async function markPaymentFailed(orderId: string, reason: string, razorpayPaymentId?: string) {
    await fetch("/api/checkout/mark-failed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, reason, razorpayPaymentId })
    });
  }

  async function placeOrder(formData: FormData) {
    if (isPlacing) return;
    setIsPlacing(true);

    const shippingAddress = {
      fullName: String(formData.get("fullName")),
      phone: String(formData.get("phone")),
      line1: String(formData.get("line1")),
      city: String(formData.get("city")),
      state: String(formData.get("state")),
      postalCode: String(formData.get("postalCode")),
      country: "India"
    };

    try {
      const response = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, shippingAddress, paymentMethod: method })
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? "Could not create order");
        return;
      }

      if (method === "COD") {
        clear();
        router.push(`/order-success?order=${data.orderId}`);
        return;
      }

      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        toast.error("Razorpay public key is missing");
        return;
      }

      if (!window.Razorpay) {
        toast.error("Razorpay checkout script failed to load");
        return;
      }

      new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "TrendyCart",
        order_id: data.razorpayOrderId,
        handler: async (payment: Record<string, string>) => {
          const verify = await fetch("/api/checkout/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payment, orderId: data.orderId })
          });
          if (verify.ok) {
            clear();
            router.push(`/order-success?order=${data.orderId}`);
          } else {
            await markPaymentFailed(data.orderId, "signature_verification_failed", payment.razorpay_payment_id);
            router.push(`/order-failure?order=${data.orderId}`);
          }
        },
        "payment.failed": async (response: { error?: { metadata?: { payment_id?: string }; reason?: string } }) => {
          await markPaymentFailed(data.orderId, response.error?.reason ?? "razorpay_payment_failed", response.error?.metadata?.payment_id);
          router.push(`/order-failure?order=${data.orderId}`);
        },
        modal: {
          ondismiss: async () => {
            await markPaymentFailed(data.orderId, "checkout_dismissed");
            router.push(`/order-failure?order=${data.orderId}`);
          }
        }
      }).open();
    } catch {
      toast.error("Something went wrong while placing your order");
    } finally {
      if (method === "COD") {
        setIsPlacing(false);
      } else {
        setTimeout(() => setIsPlacing(false), 1000);
      }
    }
  }

  return (
    <div className="container py-10">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <h1 className="text-4xl font-black tracking-normal">Checkout</h1>
      <form action={placeOrder} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4 rounded-lg border bg-card p-5">
          <h2 className="text-xl font-bold">Shipping address</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="fullName" placeholder="Full name" required />
            <Input name="phone" placeholder="Phone" required />
            <Input name="line1" placeholder="Address line" required className="md:col-span-2" />
            <Input name="city" placeholder="City" required />
            <Input name="state" placeholder="State" required />
            <Input name="postalCode" placeholder="Postal code" required />
          </div>
          <h2 className="mt-4 text-xl font-bold">Payment</h2>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 rounded-md border px-4 py-3"><input type="radio" checked={method === "RAZORPAY"} onChange={() => setMethod("RAZORPAY")} /> Razorpay</label>
            <label className="flex items-center gap-2 rounded-md border px-4 py-3"><input type="radio" checked={method === "COD"} onChange={() => setMethod("COD")} /> Cash on delivery</label>
          </div>
        </div>
        <aside className="h-fit rounded-lg border bg-card p-5">
          <h2 className="text-xl font-black tracking-normal">Order review</h2>
          <div className="mt-4 grid gap-2 text-sm">
            {items.map((item) => <div key={item.id} className="flex justify-between"><span>{item.name} x {item.quantity}</span><span>{formatPrice(item.price * item.quantity)}</span></div>)}
            <div className="flex justify-between border-t pt-3"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(shipping)}</span></div>
            <div className="flex justify-between border-t pt-3 text-lg font-black"><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>
          <Button className="mt-5 w-full" size="lg" disabled={!items.length || isPlacing}>
            {isPlacing ? "Placing order..." : "Place order"}
          </Button>
        </aside>
      </form>
    </div>
  );
}
