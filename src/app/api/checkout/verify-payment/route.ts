import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    orderId?: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };
  if (!body.orderId || !body.razorpay_order_id || !body.razorpay_payment_id || !body.razorpay_signature) {
    return NextResponse.json({ error: "Invalid payment payload" }, { status: 400 });
  }

  const existingOrder = await prisma.order.findFirst({
    where: { id: body.orderId, userId: session.user.id },
    include: { payment: true }
  });

  if (!existingOrder?.payment || existingOrder.payment.razorpayOrderId !== body.razorpay_order_id) {
    return NextResponse.json({ error: "Order payment mismatch" }, { status: 400 });
  }

  if (existingOrder.paymentStatus === "PAID") return NextResponse.json({ ok: true });

  const valid = verifyRazorpaySignature(body.razorpay_order_id, body.razorpay_payment_id, body.razorpay_signature);
  if (!valid) {
    await prisma.payment.update({ where: { orderId: body.orderId }, data: { status: "FAILED", razorpayPaymentId: body.razorpay_payment_id } });
    await prisma.order.update({ where: { id: body.orderId }, data: { paymentStatus: "FAILED" } });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id: body.orderId },
    data: {
      paymentStatus: "PAID",
      orderStatus: "CONFIRMED",
      payment: {
        update: {
          razorpayPaymentId: body.razorpay_payment_id,
          razorpaySignature: body.razorpay_signature,
          status: "PAID"
        }
      },
      statusTimeline: { create: { status: "CONFIRMED", note: "Payment verified" } },
      invoice: {
        upsert: {
          create: { number: `INV-${Date.now()}` },
          update: {}
        }
      }
    },
    include: { user: true }
  });

  console.info("Payment received", { email: order.user.email, orderNumber: order.orderNumber });
  return NextResponse.json({ ok: true });
}
