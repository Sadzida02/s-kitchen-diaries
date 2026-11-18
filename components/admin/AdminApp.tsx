"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { localePath } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import Moderation from "./Moderation";
import RecipeEditor from "./RecipeEditor";
import RecipeList from "./RecipeList";
import styles from "./Admin.module.css";

type View = { kind: "list" } | { kind: "edit"; id: string | null } | { kind: "moderate" };

// The administrator's dashboard. Only an account with the role "admin" in the database gets in;
// the database itself also refuses every change from anyone else.
export default function AdminApp({ lang }: { lang: Locale }) {
  const [supabase] = useState(() => createClient());
  const [status, setStatus] = useState<"loading" | "denied" | "ok">("loading");
  const [view, setView] = useState<View>({ kind: "list" });

  useEffect(() => {
    Promise.resolve()
      .then(() => supabase.auth.getUser())
      .then(async ({ data }) => {
        if (!data.user) return setStatus("denied");
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
        setStatus(profile?.role === "admin" ? "ok" : "denied");
      });
  }, [supabase]);

  if (status === "loading") return <p className={styles.center}>Loading…</p>;

  if (status === "denied") {
    return (
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h1>Dashboard</h1>
            <p>This page is only for the site administrator.</p>
            <Link href={localePath(lang, "/login")}>Log in</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className={`container ${styles.admin}`}>
        <div className={styles.top}>
          <h1>Dashboard</h1>
          <nav className={styles.tabs} aria-label="Dashboard">
            <button type="button" className={view.kind !== "moderate" ? styles.on : ""} onClick={() => setView({ kind: "list" })}>
              Recipes
            </button>
            <button type="button" className={view.kind === "moderate" ? styles.on : ""} onClick={() => setView({ kind: "moderate" })}>
              Comments and photos
            </button>
            <Link href={localePath(lang, "/")}>View site</Link>
          </nav>
        </div>

        {view.kind === "list" && <RecipeList supabase={supabase} onEdit={(id) => setView({ kind: "edit", id })} />}
        {view.kind === "edit" && <RecipeEditor supabase={supabase} id={view.id} onBack={() => setView({ kind: "list" })} />}
        {view.kind === "moderate" && <Moderation supabase={supabase} />}
      </div>
    </section>
  );
}
