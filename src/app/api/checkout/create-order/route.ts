import { PaymentMethod } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRazorpay } from "@/lib/razorpay";

type CheckoutItem = { id: string; quantity: number };

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    items?: CheckoutItem[];
    shippingAddress?: Record<string, string>;
    paymentMethod?: "RAZORPAY" | "COD";
  };
  if (!body.items?.length || !body.shippingAddress) return NextResponse.json({ error: "Cart and address are required" }, { status: 400 });
  if (body.items.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1)) {
    return NextResponse.json({ error: "Invalid cart quantity" }, { status: 400 });
  }

  const products = await prisma.product.findMany({ where: { id: { in: body.items.map((item) => item.id) }, approved: true } });
  let subtotal = 0;
  for (const item of body.items) {
    const product = products.find((entry) => entry.id === item.id);
    if (!product) return NextResponse.json({ error: "A cart item is no longer available" }, { status: 400 });
    if (product.stock < item.quantity) return NextResponse.json({ error: `${product.name} has only ${product.stock} left` }, { status: 400 });
    subtotal += Number(product.discountPrice ?? product.price) * item.quantity;
  }
  const shipping = 500;
  const tax = 0;
  const total = subtotal + shipping;
  const amountInPaise = Math.round(total * 100);
  const orderNumber = `TC${Date.now()}`;
  const expectedDeliveryDate = new Date();
  expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 5);

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: session.user.id,
      totalAmount: total,
      taxAmount: tax,
      shippingAmount: shipping,
      paymentMethod: (body.paymentMethod ?? "RAZORPAY") as PaymentMethod,
      paymentStatus: body.paymentMethod === "COD" ? "COD" : "PENDING",
      orderStatus: body.paymentMethod === "COD" ? "CONFIRMED" : "PENDING",
      shippingAddress: body.shippingAddress,
      expectedDeliveryDate,
      items: {
        create: body.items.map((item) => {
          const product = products.find((entry) => entry.id === item.id)!;
          return { productId: item.id, quantity: item.quantity, price: Number(product.discountPrice ?? product.price) };
        })
      },
      statusTimeline: { create: { status: body.paymentMethod === "COD" ? "CONFIRMED" : "PENDING", note: "Order created" } }
    }
  });

  if (body.paymentMethod === "COD") {
    await prisma.payment.create({ data: { orderId: order.id, amount: total, status: "COD" } });
    console.info("COD order confirmed", { email: session.user.email, orderNumber: order.orderNumber });
    return NextResponse.json({ orderId: order.id, amount: amountInPaise });
  }

  const razorpayOrder = await getRazorpay().orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: order.orderNumber,
    notes: { orderId: order.id }
  });

  await prisma.payment.create({
    data: {
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: total,
      status: "PENDING",
      rawResponse: JSON.parse(JSON.stringify(razorpayOrder))
    }
  });

  return NextResponse.json({ orderId: order.id, razorpayOrderId: razorpayOrder.id, amount: amountInPaise });
}
