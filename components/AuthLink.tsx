"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// The navbar link to the login page. It says "Log in", or your first name once you are signed in.
export default function AuthLink({
  href,
  profileHref,
  loginLabel,
  accountLabel,
  className,
  children,
}: {
  href: string;
  profileHref: string;
  loginLabel: string;
  accountLabel: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const show = (user: { email?: string; user_metadata?: Record<string, unknown> } | null | undefined) =>
      setName(user ? String(user.user_metadata?.full_name ?? user.email ?? accountLabel).split(" ")[0] : null);
    supabase.auth.getUser().then(({ data }) => show(data.user));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => show(session?.user));
    return () => data.subscription.unsubscribe();
  }, [accountLabel]);

  return (
    <Link href={name ? profileHref : href} className={className}>
      {children}
      {name ?? loginLabel}
    </Link>
  );
}
