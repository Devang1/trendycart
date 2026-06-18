import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { productId } = (await request.json()) as { productId?: string };
  if (!productId) return NextResponse.json({ error: "Product required" }, { status: 400 });
  const count = await prisma.productComparison.count({ where: { userId: session.user.id } });
  if (count >= 4) return NextResponse.json({ error: "Compare up to 4 products" }, { status: 400 });
  const item = await prisma.productComparison.upsert({
    where: { userId_productId: { userId: session.user.id, productId } },
    update: {},
    create: { userId: session.user.id, productId }
  });
  return NextResponse.json(item);
}
