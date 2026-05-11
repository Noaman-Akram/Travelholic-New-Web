import { NextResponse, type NextRequest } from "next/server";
import { readPaymentAudit, paymentAudit } from "@/lib/payment/auditLog";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = process.env.PAYMENT_AUDIT_LOG_TOKEN?.trim();
  const supplied =
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ||
    req.nextUrl.searchParams.get("token")?.trim();

  if (!token || supplied !== token) {
    return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  }

  const limit = Number(req.nextUrl.searchParams.get("limit") ?? 200);
  const events = await readPaymentAudit(Number.isFinite(limit) ? limit : 200);

  await paymentAudit({
    event: "payment_audit_logs_read",
    source: "logs",
    details: { count: events.length },
  });

  return NextResponse.json({
    ok: true,
    count: events.length,
    events,
  });
}
