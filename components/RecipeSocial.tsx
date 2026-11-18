"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { notifyNewPost } from "@/app/actions/notify";
import { shrinkImage } from "@/lib/shrink-image";
import { getDictionary } from "@/lib/dictionaries";
import { localePath } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import styles from "./RecipeSocial.module.css";

type Person = { display_name: string; avatar_url: string | null } | null;
type Comment = { id: string; body: string; created_at: string; user_id: string; profiles: Person };
type Recreation = { id: string; image_path: string; caption: string | null; created_at: string; user_id: string; profiles: Person };

const BUCKET = "recreations";

// Likes, comments and "I made this" photos for one recipe.
export default function RecipeSocial({ recipeId, slug, lang }: { recipeId: string; slug: string; lang: Locale }) {
  const t = getDictionary(lang).social;
  const [supabase] = useState(() => createClient());
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [recreations, setRecreations] = useState<Recreation[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");

  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    const id = auth.user?.id ?? null;
    const [commentRows, photoRows, profile] = await Promise.all([
      supabase
        .from("comments")
        .select("id, body, created_at, user_id, profiles(display_name, avatar_url)")
        .eq("recipe_id", recipeId)
        .order("created_at", { ascending: false }),
      supabase
        .from("recreations")
        .select("id, image_path, caption, created_at, user_id, profiles(display_name, avatar_url)")
        .eq("recipe_id", recipeId)
        .order("created_at", { ascending: false }),
      id ? supabase.from("profiles").select("role").eq("id", id).maybeSingle() : Promise.resolve({ data: null }),
    ]);
    setUserId(id);
    setIsAdmin(profile.data?.role === "admin");
    setComments((commentRows.data ?? []) as unknown as Comment[]);
    setRecreations((photoRows.data ?? []) as unknown as Recreation[]);
  }, [supabase, recipeId]);

  useEffect(() => {
    Promise.resolve().then(load);
    const { data } = supabase.auth.onAuthStateChange(() => void load());
    return () => data.subscription.unsubscribe();
  }, [load, supabase]);

  const loginHref = `${localePath(lang, "/login")}?next=${encodeURIComponent(localePath(lang, `/recipes/${slug}`))}`;
  const when = (iso: string) => new Date(iso).toLocaleDateString(lang === "bs" ? "bs-BA" : "en-GB", { dateStyle: "medium" });
  const who = (person: Person) => person?.display_name || t.someone;

  // tell the administrator by email (does nothing until the email service is set up)
  const announce = async (kind: "comment" | "recreation", id: string) => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) await notifyNewPost(kind, id, data.session.access_token);
    } catch {
      // the post is saved either way
    }
  };

  const addComment = async (event: React.FormEvent) => {
    event.preventDefault();
    const body = text.trim();
    if (!userId || !body) return;
    setBusy(true);
    setProblem("");
    const { data, error } = await supabase.from("comments").insert({ recipe_id: recipeId, user_id: userId, body }).select("id").single();
    if (error) setProblem(t.error);
    else {
      setText("");
      void announce("comment", data.id);
    }
    await load();
    setBusy(false);
  };

  const removeComment = async (id: string) => {
    await supabase.from("comments").delete().eq("id", id);
    await load();
  };

  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!userId || !file) return;
    if (!file.type.startsWith("image/")) return setProblem(t.notImage);
    setBusy(true);
    setProblem("");
    try {
      const blob = await shrinkImage(file);
      const path = `${userId}/${crypto.randomUUID()}.webp`;
      const sent = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: "image/webp" });
      if (sent.error) throw sent.error;
      const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      const saved = await supabase
        .from("recreations")
        .insert({ recipe_id: recipeId, user_id: userId, image_path: url, caption: null })
        .select("id")
        .single();
      if (saved.error) throw saved.error;
      void announce("recreation", saved.data.id);
    } catch {
      setProblem(t.error);
    }
    await load();
    setBusy(false);
  };

  const removePhoto = async (item: Recreation) => {
    await supabase.from("recreations").delete().eq("id", item.id);
    const marker = `/${BUCKET}/`;
    const at = item.image_path.indexOf(marker);
    if (at >= 0) await supabase.storage.from(BUCKET).remove([item.image_path.slice(at + marker.length)]);
    await load();
  };

  return (
    <section className={styles.social} aria-label={t.title}>
      <div className={styles.columns}>
        <div className={styles.block}>
          <h2>
            <span className={styles.count}>{comments.length}</span> {t.commentsTitle}
          </h2>
          {userId ? (
            <form className={styles.form} onSubmit={addComment}>
              <textarea
                required
                maxLength={1000}
                rows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t.commentPlaceholder}
                aria-label={t.commentPlaceholder}
              />
              <button type="submit" className={`${styles.button} ${styles.right}`} disabled={busy}>
                {t.post}
              </button>
            </form>
          ) : (
            <p className={styles.login}>
              <Link href={loginHref}>{t.loginToComment}</Link>
            </p>
          )}
          {comments.length === 0 && <p className={styles.empty}>{t.noComments}</p>}
          <ul className={styles.comments}>
            {comments.map((comment) => (
              <li key={comment.id}>
                <p className={styles.by}>
                  <strong>{who(comment.profiles)}</strong> · {when(comment.created_at)}
                </p>
                <p>{comment.body}</p>
                {(comment.user_id === userId || isAdmin) && (
                  <button type="button" className={styles.remove} onClick={() => removeComment(comment.id)}>
                    {t.remove}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.block}>
          <h2>{t.madeTitle}</h2>
          <ul className={styles.photos}>
            <li>
              {/* the big square with a plus: pick a photo (or go and log in first) */}
              {userId ? (
                <label className={`${styles.add} ${busy ? styles.disabled : ""}`}>
                  <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                    <path d="M12 4v16M4 12h16" />
                  </svg>
                  <span>{t.addPhoto}</span>
                  <input type="file" accept="image/*" hidden disabled={busy} onChange={upload} />
                </label>
              ) : (
                <Link href={loginHref} className={styles.add}>
                  <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                    <path d="M12 4v16M4 12h16" />
                  </svg>
                  <span>{t.loginToShare}</span>
                </Link>
              )}
            </li>
            {recreations.map((item) => (
              <li key={item.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image_path} alt={item.caption || t.madeAlt} loading="lazy" />
                <p className={styles.by}>
                  <strong>{who(item.profiles)}</strong> · {when(item.created_at)}
                </p>
                {item.caption && <p>{item.caption}</p>}
                {(item.user_id === userId || isAdmin) && (
                  <button type="button" className={styles.remove} onClick={() => removePhoto(item)}>
                    {t.remove}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {problem && <p className={styles.problem}>{problem}</p>}
    </section>
  );
}
