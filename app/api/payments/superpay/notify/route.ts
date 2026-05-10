import { NextResponse, type NextRequest } from "next/server";
import { decodeSuperPayNotification } from "@/lib/superpay/client";

export async function GET(req: NextRequest) {
  const encoded = req.nextUrl.searchParams.get("response");
  const notification = encoded ? decodeSuperPayNotification(encoded) : null;

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log("[superpay] notification", notification ?? Object.fromEntries(req.nextUrl.searchParams));
  }

  return NextResponse.json({ ok: true });
}
