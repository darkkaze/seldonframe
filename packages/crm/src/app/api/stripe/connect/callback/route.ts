import { NextResponse } from "next/server";
import { completeStripeConnectFromCode } from "@/lib/payments/actions";
import { publicOrigin } from "@/lib/http/public-origin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(new URL("/settings/payments?error=connect_callback", publicOrigin(request)));
  }

  try {
    await completeStripeConnectFromCode({ code, state });
    return NextResponse.redirect(new URL("/settings/payments?connected=1", publicOrigin(request)));
  } catch {
    return NextResponse.redirect(new URL("/settings/payments?error=connect_failed", publicOrigin(request)));
  }
}
