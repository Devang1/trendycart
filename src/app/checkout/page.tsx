import { requireUser } from "@/lib/session";
import { CheckoutView } from "@/components/shop/checkout-view";

export default async function CheckoutPage() {
  await requireUser();
  return <CheckoutView />;
}
