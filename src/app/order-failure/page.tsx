import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OrderFailurePage() {
  return (
    <div className="container grid min-h-[60vh] place-items-center py-10 text-center">
      <div>
        <h1 className="text-4xl font-black tracking-normal">Payment incomplete</h1>
        <p className="mt-3 text-muted-foreground">No worries. The transaction was marked failed or cancelled and your cart can be retried.</p>
        <Button asChild className="mt-6"><Link href="/checkout">Try again</Link></Button>
      </div>
    </div>
  );
}
