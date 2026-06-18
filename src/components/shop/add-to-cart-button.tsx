"use client";

import { ShoppingCart, Zap } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { type CartProduct, useCartStore } from "@/store/cart";

type PurchaseButtonProps = {
  className?: string;
  product: CartProduct;
};

export function AddToCartButton({ product, className }: PurchaseButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  return (
    <Button className={className} disabled={product.stock <= 0} onClick={() => {
      addItem(product);
      toast.success("Added to cart");
    }}>
      <ShoppingCart className="h-4 w-4" /> Add to cart
    </Button>
  );
}

export function BuyNowButton({ product, className }: PurchaseButtonProps) {
  const router = useRouter();
  const { status } = useSession();
  const addItem = useCartStore((state) => state.addItem);

  return (
    <Button
      className={className}
      disabled={product.stock <= 0 || status === "loading"}
      variant="secondary"
      onClick={() => {
        addItem(product);

        if (status !== "authenticated") {
          toast.error("Please login to checkout");
          router.push(`/login?callbackUrl=${encodeURIComponent("/checkout")}`);
          return;
        }

        router.push("/checkout");
      }}
    >
      <Zap className="h-4 w-4" /> Buy now
    </Button>
  );
}
