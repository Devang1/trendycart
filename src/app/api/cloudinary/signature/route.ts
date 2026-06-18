import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { signedUploadParams } from "@/lib/cloudinary";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SELLER", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { folder } = (await request.json().catch(() => ({}))) as { folder?: string };
  return NextResponse.json(signedUploadParams(folder));
}
