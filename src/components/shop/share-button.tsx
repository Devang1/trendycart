"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ShareButtonProps = {
  className?: string;
  description?: string;
  iconOnly?: boolean;
  title: string;
  url: string;
};

export function ShareButton({ className, description, iconOnly = false, title, url }: ShareButtonProps) {
  async function share() {
    const shareUrl = new URL(url, window.location.origin).toString();

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: description,
          url: shareUrl
        });
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      toast.success("Product link copied");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Could not share this product");
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size={iconOnly ? "icon" : "sm"}
      className={cn(iconOnly && "h-8 w-8 rounded-full", className)}
      aria-label={iconOnly ? "Share product" : undefined}
      onClick={share}
    >
      <Share2 className="h-4 w-4" />
      {!iconOnly && "Share"}
    </Button>
  );
}
