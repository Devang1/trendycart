"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WishlistButtonProps = {
  className?: string;
  iconClassName?: string;
  initialWishlisted?: boolean;
  productId: string;
  showLabel?: boolean;
};

export function WishlistButton({
  className,
  iconClassName,
  initialWishlisted = false,
  productId,
  showLabel = true
}: WishlistButtonProps) {
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadWishlistStatus() {
      try {
        const response = await fetch(`/api/wishlist?productId=${encodeURIComponent(productId)}`);
        if (!response.ok) return;

        const data = (await response.json()) as { wishlisted?: boolean };
        if (!cancelled) setWishlisted(Boolean(data.wishlisted));
      } catch {
        // Keep the server-provided/default state for guests or transient network failures.
      }
    }

    loadWishlistStatus();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  async function toggleWishlist() {
    if (pending) return;

    const nextWishlisted = !wishlisted;
    setWishlisted(nextWishlisted);
    setPending(true);

    try {
      const response = await fetch("/api/wishlist", {
        method: nextWishlisted ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId })
      });

      if (response.status === 401) {
        setWishlisted(wishlisted);
        toast.error("Please login to manage your wishlist");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Wishlist update failed");
      }

      toast.success(nextWishlisted ? "Added to wishlist" : "Removed from wishlist");
      router.refresh();
    } catch (error) {
      setWishlisted(wishlisted);
      toast.error(error instanceof Error ? error.message : "Wishlist update failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={showLabel ? "sm" : "icon"}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={wishlisted}
      className={cn(wishlisted && "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15", className)}
      disabled={pending}
      onClick={toggleWishlist}
    >
      <Heart className={cn("h-4 w-4", wishlisted && "fill-current", iconClassName)} />
      {showLabel ? (wishlisted ? "Wishlisted" : "Wishlist") : null}
    </Button>
  );
}
