import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OrderSuccessPage() {
  return (
    <div className="container grid min-h-[60vh] place-items-center py-10 text-center">
      <div>
        <h1 className="text-4xl font-black tracking-normal">Order confirmed</h1>
        <p className="mt-3 text-muted-foreground">Payment and order status are saved. You can track the timeline from your orders page.</p>
        <Button asChild className="mt-6"><Link href="/orders">View orders</Link></Button>
      </div>
    </div>
  );
}
