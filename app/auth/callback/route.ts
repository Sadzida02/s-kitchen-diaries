import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Google (or the email link) sends the visitor back here with a one-time code, which is
// exchanged for a login. Then the visitor is sent on to the page they came from.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/en/login";
  // only ever go to a page on this site
  const target = next.startsWith("/") && !next.startsWith("//") ? next : "/en/login";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${target}`);
  }
  return NextResponse.redirect(`${origin}${target}${target.includes("?") ? "&" : "?"}error=1`);
}
