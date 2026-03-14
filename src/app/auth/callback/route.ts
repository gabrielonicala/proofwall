import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/dashboard";

  // On Vercel, request.url may use an internal origin — use x-forwarded-host instead
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";
  let redirectBase: string;
  if (isLocal) {
    redirectBase = origin;
  } else if (forwardedHost) {
    redirectBase = `https://${forwardedHost}`;
  } else {
    redirectBase = origin;
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${redirectBase}${next}`);
    }
  }

  // Auth error — redirect to login with error
  return NextResponse.redirect(`${redirectBase}/login?error=auth`);
}
