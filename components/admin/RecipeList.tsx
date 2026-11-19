"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { refreshRecipes } from "@/app/actions/recipes";
import styles from "./Admin.module.css";

type Row = {
  id: string;
  slug: string;
  taste: string;
  published: boolean;
  added: string | null;
  podium: number | null;
  recipe_translations: { lang: string; title: string }[];
};

export default function RecipeList({ supabase, onEdit }: { supabase: SupabaseClient; onEdit: (id: string | null) => void }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("recipes")
      .select("id, slug, taste, published, added, podium, recipe_translations(lang, title)")
      .order("added", { ascending: false })
      .limit(1000);
    setRows((data ?? []) as unknown as Row[]);
  }, [supabase]);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  const refresh = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) await refreshRecipes(data.session.access_token);
  };

  const togglePublished = async (row: Row) => {
    setMessage("");
    const { error } = await supabase.from("recipes").update({ published: !row.published }).eq("id", row.id);
    if (error) return setMessage(error.message);
    await refresh();
    await load();
  };

  const remove = async (row: Row) => {
    const name = row.recipe_translations.find((t) => t.lang === "en")?.title ?? row.slug;
    if (!window.confirm(`Delete "${name}" for good? Its likes and comments are deleted too.`)) return;
    const { error } = await supabase.from("recipes").delete().eq("id", row.id);
    if (error) return setMessage(error.message);
    await refresh();
    await load();
  };

  // downloads every recipe (all text in both languages, photo links, tags, dates) as one JSON file
  const backup = async () => {
    setMessage("");
    const { data, error } = await supabase
      .from("recipes")
      .select("*, recipe_translations(*), recipe_photos(*)")
      .order("added", { ascending: false })
      .limit(1000);
    if (error) return setMessage(error.message);
    const file = new Blob([JSON.stringify({ savedAt: new Date().toISOString(), count: data.length, recipes: data }, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = `recipes-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    setMessage(`Backup saved: ${data.length} recipes.`);
  };

  const term = search.trim().toLowerCase();
  const shown = (rows ?? []).filter((row) =>
    !term || row.slug.includes(term) || row.recipe_translations.some((t) => t.title.toLowerCase().includes(term)),
  );

  return (
    <div>
      <div className={styles.bar}>
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search recipes…" aria-label="Search recipes" />
        <div className={styles.actions}>
          <button type="button" onClick={backup}>
            Download backup
          </button>
          <button type="button" className={styles.primary} onClick={() => onEdit(null)}>
            + New recipe
          </button>
        </div>
      </div>
      {message && <p className={message.startsWith("Backup") ? styles.ok : styles.error}>{message}</p>}
      {rows === null ? (
        <p className={styles.center}>Loading…</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Recipe</th>
              <th>Taste</th>
              <th>Added</th>
              <th>Podium</th>
              <th>Shown on site</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr key={row.id}>
                <td>
                  <strong>{row.recipe_translations.find((t) => t.lang === "en")?.title ?? row.slug}</strong>
                  <span className={styles.slug}>{row.slug}</span>
                </td>
                <td>{row.taste}</td>
                <td>{row.added}</td>
                <td>{row.podium ?? "-"}</td>
                <td>
                  <label className={styles.switch}>
                    <input type="checkbox" checked={row.published} onChange={() => togglePublished(row)} />
                    {row.published ? "Yes" : "Hidden"}
                  </label>
                </td>
                <td className={styles.actions}>
                  <button type="button" onClick={() => onEdit(row.id)}>
                    Edit
                  </button>
                  <button type="button" className={styles.danger} onClick={() => remove(row)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
