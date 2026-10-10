import { NextRequest, NextResponse } from "next/server";
import { establishPortalMagicSession } from "@/lib/portal/auth";
import { publicOrigin } from "@/lib/http/public-origin";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orgSlug: string }> }
) {
  const { orgSlug } = await context.params;
  const token = request.nextUrl.searchParams.get("token")?.trim() || "";
  const redirectTo = request.nextUrl.searchParams.get("redirect");

  if (!token) {
    return NextResponse.redirect(new URL(`/customer/${orgSlug}/login?error=missing_magic_link`, publicOrigin(request)));
  }

  try {
    const result = await establishPortalMagicSession({
      orgSlug,
      token,
      redirectTo,
    });

    return NextResponse.redirect(new URL(result.redirectTo, publicOrigin(request)));
  } catch {
    return NextResponse.redirect(new URL(`/customer/${orgSlug}/login?error=invalid_magic_link`, publicOrigin(request)));
  }
}
