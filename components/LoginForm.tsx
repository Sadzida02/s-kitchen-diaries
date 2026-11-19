"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getDictionary } from "@/lib/dictionaries";
import { localePath } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import styles from "./LoginForm.module.css";

// The login page: "Continue with Google", or an email link. When you are signed in it shows your name and a log out button.
export default function LoginForm({ lang }: { lang: Locale }) {
  const t = getDictionary(lang).auth;
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [tooMany, setTooMany] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (new URLSearchParams(window.location.search).has("error")) setFailed(true);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  // after logging in, go back to the page that sent you here (only pages of this site)
  const back = () => {
    const asked = new URLSearchParams(window.location.search).get("next") ?? "";
    const next = asked.startsWith("/") && !asked.startsWith("//") ? asked : `/${lang}/profile`;
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  };

  const google = async () => {
    setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: back() } });
    if (error) setFailed(true);
  };

  const emailLink = async (event: React.FormEvent) => {
    event.preventDefault();
    setFailed(false);
    setTooMany(false);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: back() } });
    if (error?.status === 429) setTooMany(true);
    else if (error) setFailed(true);
    else setMessage(t.checkEmail);
  };

  if (!ready) return <p className={styles.note}>{t.loading}</p>;

  if (user) {
    const name = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "";
    return (
      <div className={styles.card}>
        <p className={styles.hello}>{t.signedInAs}</p>
        <p className={styles.name}>{name}</p>
        {user.email && name !== user.email && <p className={styles.note}>{user.email}</p>}
        <Link href={localePath(lang, "/profile")} className={styles.button}>
          {t.myProfile}
        </Link>
        <button type="button" className={styles.button} onClick={() => supabase.auth.signOut()}>
          {t.logOut}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <button type="button" className={`${styles.button} ${styles.google}`} onClick={google}>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.5Z" />
          <path fill="#34A853" d="M12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A11.5 11.5 0 0 0 12 23.5Z" />
          <path fill="#FBBC05" d="M5.6 14.2a6.9 6.9 0 0 1 0-4.4v-3H1.8a11.5 11.5 0 0 0 0 10.4l3.8-3Z" />
          <path fill="#EA4335" d="M12 5.4c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.4 11.4 0 0 0 12 .5 11.5 11.5 0 0 0 1.8 6.8l3.8 3C6.5 7.4 9 5.4 12 5.4Z" />
        </svg>
        {t.google}
      </button>

      <p className={styles.or}>{t.or}</p>

      <form onSubmit={emailLink} className={styles.form}>
        <label htmlFor="login-email">{t.emailLabel}</label>
        <input
          id="login-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />
        <button type="submit" className={styles.button}>
          {t.sendLink}
        </button>
      </form>

      {message && <p className={styles.ok}>{message}</p>}
      {tooMany && <p className={styles.error}>{t.tooMany}</p>}
      {failed && <p className={styles.error}>{t.error}</p>}
    </div>
  );
}
