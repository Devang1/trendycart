import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    orderId?: string;
    razorpayPaymentId?: string;
    reason?: string;
  };

  if (!body.orderId) return NextResponse.json({ error: "Order id is required" }, { status: 400 });

  const order = await prisma.order.findFirst({
    where: { id: body.orderId, userId: session.user.id },
    include: { payment: true }
  });

  if (!order?.payment) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.paymentStatus === "PAID") return NextResponse.json({ ok: true });

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "FAILED",
      payment: {
        update: {
          status: "FAILED",
          razorpayPaymentId: body.razorpayPaymentId
        }
      }
    }
  });

  console.info("Payment marked failed", {
    orderNumber: order.orderNumber,
    reason: body.reason ?? "checkout_failed_or_dismissed"
  });

  return NextResponse.json({ ok: true });
}
