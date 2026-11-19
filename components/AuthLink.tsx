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
    // the name shown is the one from the profile page (for Google and email logins alike), first word only
    const apply = (full: string | null) => setName(full ? full.split(" ")[0] : null);
    const load = async (user: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null | undefined) => {
      if (!user) return apply(null);
      const { data } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
      apply(data?.display_name || String(user.user_metadata?.full_name ?? user.email ?? accountLabel));
    };
    supabase.auth.getUser().then(({ data }) => load(data.user));
    // (the work is started a moment later: the login library must not be asked for more while it is still announcing a change)
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => void load(session?.user), 0);
    });
    // the profile page announces a new name as soon as it is saved
    const onName = (event: Event) => apply((event as CustomEvent<string>).detail);
    window.addEventListener("profile-name", onName);
    return () => {
      data.subscription.unsubscribe();
      window.removeEventListener("profile-name", onName);
    };
  }, [accountLabel]);

  return (
    <Link href={name ? profileHref : href} className={className}>
      {children}
      {name ?? loginLabel}
    </Link>
  );
}
