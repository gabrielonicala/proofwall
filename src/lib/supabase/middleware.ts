import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — important for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /dashboard routes
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages
  if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Security headers
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  supabaseResponse.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' 'unsafe-eval'`,
      `style-src 'self' 'unsafe-inline'`,
      `img-src 'self' data: blob: https://api.dicebear.com ${supabaseUrl} https:`,
      `font-src 'self'`,
      `connect-src 'self' ${supabaseUrl} https://*.supabase.co`,
      `frame-src 'self'`,
      `frame-ancestors 'self' *`, // Allow embedding in iframes for the embed feature
      `object-src 'none'`,
      `base-uri 'self'`,
      `form-action 'self'`,
    ].join("; ")
  );

  supabaseResponse.headers.set("X-Content-Type-Options", "nosniff");
  supabaseResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  supabaseResponse.headers.set("X-Frame-Options", "SAMEORIGIN");

  // Remove X-Frame-Options for embed routes (they need to be iframed)
  if (request.nextUrl.pathname.startsWith("/embed/")) {
    supabaseResponse.headers.delete("X-Frame-Options");
  }

  return supabaseResponse;
}
