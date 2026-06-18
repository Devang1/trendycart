import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await request.text();
  return NextResponse.json(
    { error: "Razorpay webhooks are disabled. Checkout status is handled by payment verification." },
    { status: 410 }
  );
}
