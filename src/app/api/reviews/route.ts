import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = reviewSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid review" }, { status: 400 });

  const review = await prisma.review.upsert({
    where: { userId_productId: { userId: session.user.id, productId: parsed.data.productId } },
    update: { rating: parsed.data.rating, comment: parsed.data.comment },
    create: { userId: session.user.id, ...parsed.data }
  });

  const aggregate = await prisma.review.aggregate({
    where: { productId: parsed.data.productId },
    _avg: { rating: true },
    _count: true
  });
  await prisma.product.update({
    where: { id: parsed.data.productId },
    data: { rating: aggregate._avg.rating ?? 0, reviewCount: aggregate._count }
  });

  return NextResponse.json(review);
}
