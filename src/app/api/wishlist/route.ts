import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (productId) {
    const item = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: session.user.id, productId } },
      select: { id: true }
    });

    return NextResponse.json({ wishlisted: Boolean(item) });
  }

  const wishlist = await prisma.wishlist.findMany({ where: { userId: session.user.id }, include: { product: true } });
  return NextResponse.json(wishlist);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { productId } = (await request.json()) as { productId?: string };
  if (!productId) return NextResponse.json({ error: "Product required" }, { status: 400 });
  const item = await prisma.wishlist.upsert({
    where: { userId_productId: { userId: session.user.id, productId } },
    update: {},
    create: { userId: session.user.id, productId }
  });
  return NextResponse.json(item);
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { productId } = (await request.json()) as { productId?: string };
  if (!productId) return NextResponse.json({ error: "Product required" }, { status: 400 });

  await prisma.wishlist.deleteMany({
    where: { userId: session.user.id, productId }
  });

  return NextResponse.json({ ok: true });
}
