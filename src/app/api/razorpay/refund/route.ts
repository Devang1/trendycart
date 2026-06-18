import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getRazorpay } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { paymentId, amount, reason } = (await request.json()) as { paymentId?: string; amount?: number; reason?: string };
  if (!paymentId || !amount) return NextResponse.json({ error: "Payment and amount required" }, { status: 400 });

  const payment = await prisma.payment.findUniqueOrThrow({ where: { id: paymentId } });
  if (!payment.razorpayPaymentId) return NextResponse.json({ error: "Razorpay payment id missing" }, { status: 400 });

  const razorpay = getRazorpay() as unknown as {
    payments: { refund: (id: string, input: { amount: number; notes: { reason: string | null } }) => Promise<{ id: string }> };
  };
  const refund = await razorpay.payments.refund(payment.razorpayPaymentId, { amount: amount * 100, notes: { reason: reason ?? null } });
  const saved = await prisma.refund.create({ data: { paymentId, amount, reason, razorpayRefundId: refund.id, status: "REFUNDED" } });
  return NextResponse.json(saved);
}
