import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cart = await prisma.cart.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
    include: { items: { include: { product: true } } }
  });
  return NextResponse.json(cart);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { productId, quantity = 1 } = (await request.json()) as { productId?: string; quantity?: number };
  if (!productId) return NextResponse.json({ error: "Product required" }, { status: 400 });

  const cart = await prisma.cart.upsert({ where: { userId: session.user.id }, update: {}, create: { userId: session.user.id } });
  const item = await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity },
    create: { cartId: cart.id, productId, quantity }
  });
  return NextResponse.json(item);
}
