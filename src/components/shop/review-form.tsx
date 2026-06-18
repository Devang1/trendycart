"use client";

import { Loader2, MessageSquareText, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ReviewForm({ productId }: { productId: string }) {
  const router = useRouter();
  const { status } = useSession();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (status === "loading") {
    return <div className="h-56 animate-pulse rounded-lg border bg-muted/50" />;
  }

  if (status === "unauthenticated") {
    return (
      <div className="border-y bg-muted/40 p-5 sm:rounded-lg sm:border">
        <MessageSquareText className="h-6 w-6 text-primary" />
        <h3 className="mt-3 font-bold">Share your experience</h3>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to rate this product and write a review.</p>
        <Button asChild className="mt-4" size="sm"><Link href="/login">Sign in to review</Link></Button>
      </div>
    );
  }

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rating) {
      toast.error("Choose a star rating");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment: comment.trim() || undefined })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to publish review");

      toast.success("Review published");
      setComment("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to publish review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submitReview} className="border-y bg-card p-5 sm:rounded-lg sm:border">
      <h3 className="font-bold">Write a review</h3>
      <p className="mt-1 text-sm text-muted-foreground">Your feedback helps other shoppers decide.</p>
      <fieldset className="mt-4">
        <legend className="text-sm font-semibold">Your rating</legend>
        <div className="mt-2 flex gap-1" role="group" aria-label="Product rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`${star} star${star === 1 ? "" : "s"}`}
              aria-pressed={rating === star}
              onClick={() => setRating(star)}
              className="rounded-md p-1.5 transition hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Star className={`h-6 w-6 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/50"}`} />
            </button>
          ))}
        </div>
      </fieldset>
      <label htmlFor="review-comment" className="mt-4 block text-sm font-semibold">Review</label>
      <textarea
        id="review-comment"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        maxLength={1000}
        rows={4}
        placeholder="What did you like? How was the quality?"
        className="mt-2 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">{comment.length}/1000</span>
        <Button type="submit" disabled={submitting || rating === 0}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquareText className="h-4 w-4" />}
          {submitting ? "Publishing" : "Publish review"}
        </Button>
      </div>
    </form>
  );
}
