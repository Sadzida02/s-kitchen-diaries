"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { deleteAccount } from "@/app/actions/account";
import { createClient } from "@/lib/supabase/client";
import { getDictionary } from "@/lib/dictionaries";
import { localePath } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import styles from "./ProfileApp.module.css";

type Names = { lang: string; title: string }[];
type Recipe = { slug: string; cover_image?: string | null; recipe_translations: Names } | null;
type Liked = { recipes: Recipe };
type Comment = { id: string; body: string; created_at: string; recipes: Recipe };
type Photo = { id: string; image_path: string; created_at: string; recipes: Recipe };

// The visitor's own page: name, liked recipes, own comments and photos, log out and delete account.
export default function ProfileApp({ lang }: { lang: Locale }) {
  const t = getDictionary(lang).profile;
  const s = getDictionary(lang).social;
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saved, setSaved] = useState("");
  const [liked, setLiked] = useState<Liked[] | null>(null);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [problem, setProblem] = useState("");

  const titleOf = (recipe: Recipe) =>
    recipe ? ((recipe.recipe_translations.find((n) => n.lang === lang) ?? recipe.recipe_translations[0])?.title ?? recipe.slug) : "";
  const href = (recipe: Recipe) => localePath(lang, `/recipes/${recipe?.slug ?? ""}`);
  const when = (iso: string) => new Date(iso).toLocaleDateString(lang === "bs" ? "bs-BA" : "en-GB", { dateStyle: "medium" });

  const load = useCallback(
    async (id: string) => {
      const names = "slug, recipe_translations(lang, title)";
      const [profile, likes, mine, pics] = await Promise.all([
        supabase.from("profiles").select("display_name, avatar_url, role").eq("id", id).maybeSingle(),
        supabase.from("likes").select(`created_at, recipes(slug, cover_image, recipe_translations(lang, title))`).eq("user_id", id).order("created_at", { ascending: false }),
        supabase.from("comments").select(`id, body, created_at, recipes(${names})`).eq("user_id", id).order("created_at", { ascending: false }),
        supabase.from("recreations").select(`id, image_path, created_at, recipes(${names})`).eq("user_id", id).order("created_at", { ascending: false }),
      ]);
      setName(profile.data?.display_name ?? "");
      setAvatar(profile.data?.avatar_url ?? null);
      setIsAdmin(profile.data?.role === "admin");
      setLiked((likes.data ?? []) as unknown as Liked[]);
      setComments((mine.data ?? []) as unknown as Comment[]);
      setPhotos((pics.data ?? []) as unknown as Photo[]);
    },
    [supabase],
  );

  useEffect(() => {
    Promise.resolve()
      .then(() => supabase.auth.getUser())
      .then(async ({ data }) => {
        setUser(data.user);
        if (data.user) await load(data.user.id);
        setReady(true);
      });
  }, [supabase, load]);

  if (!ready) return <p className={styles.center}>{t.loading}</p>;

  if (!user) {
    return (
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h1>{t.title}</h1>
            <p>
              <Link href={`${localePath(lang, "/login")}?next=${encodeURIComponent(localePath(lang, "/profile"))}`}>{t.loginPrompt}</Link>
            </p>
          </div>
        </div>
      </section>
    );
  }

  const saveName = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaved("");
    const { error } = await supabase.from("profiles").update({ display_name: name.trim() || t.defaultName }).eq("id", user.id);
    setSaved(error ? s.error : t.saved);
  };

  const removeComment = async (id: string) => {
    await supabase.from("comments").delete().eq("id", id);
    await load(user.id);
  };

  const removePhoto = async (item: Photo) => {
    await supabase.from("recreations").delete().eq("id", item.id);
    const marker = "/recreations/";
    const at = item.image_path.indexOf(marker);
    if (at >= 0) await supabase.storage.from("recreations").remove([item.image_path.slice(at + marker.length)]);
    await load(user.id);
  };

  const logOut = async () => {
    await supabase.auth.signOut();
    router.push(localePath(lang, "/"));
  };

  const removeAccount = async () => {
    if (!window.confirm(t.deleteConfirm)) return;
    setProblem("");
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      await deleteAccount(data.session.access_token);
      await supabase.auth.signOut();
      router.push(localePath(lang, "/"));
    } catch (error) {
      setProblem((error as Error).message || s.error);
    }
  };

  return (
    <section className="section">
      <div className={`container ${styles.page}`}>
        <div className={styles.head}>
          <div className={styles.avatar} aria-hidden="true">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" referrerPolicy="no-referrer" />
            ) : (
              <span>{(name || user.email || "?").slice(0, 1).toUpperCase()}</span>
            )}
          </div>
          <div className={styles.who}>
            <p className="kicker">{t.kicker}</p>
            <h1>{name || t.defaultName}</h1>
            <p className={styles.muted}>{user.email}</p>
          </div>
          <div className={styles.buttons}>
            {isAdmin && (
              <Link href={localePath(lang, "/admin")} className={styles.button}>
                {t.dashboard}
              </Link>
            )}
            <button type="button" className={styles.ghost} onClick={logOut}>
              {t.logOut}
            </button>
          </div>
        </div>

        <form className={styles.card} onSubmit={saveName}>
          <label htmlFor="profile-name">{t.nameLabel}</label>
          <div className={styles.row}>
            <input id="profile-name" type="text" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
            <button type="submit" className={styles.button}>
              {t.save}
            </button>
          </div>
          <p className={styles.muted}>{t.nameHint}</p>
          {saved && <p className={styles.ok}>{saved}</p>}
        </form>

        <section className={styles.card}>
          <h2>
            {s.likedTitle} <span className={styles.count}>{liked?.length ?? 0}</span>
          </h2>
          {liked?.length === 0 && <p className={styles.muted}>{s.noLikes}</p>}
          <ul className={styles.likes}>
            {liked?.map((item) => (
              <li key={item.recipes?.slug}>
                <Link href={href(item.recipes)}>
                  {item.recipes?.cover_image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.recipes.cover_image} alt="" loading="lazy" />
                  )}
                  <span>{titleOf(item.recipes)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className={styles.two}>
          <section className={styles.card}>
            <h2>
              {t.commentsTitle} <span className={styles.count}>{comments?.length ?? 0}</span>
            </h2>
            {comments?.length === 0 && <p className={styles.muted}>{t.noComments}</p>}
            <ul className={styles.list}>
              {comments?.map((item) => (
                <li key={item.id}>
                  <p className={styles.muted}>
                    <Link href={href(item.recipes)}>{titleOf(item.recipes)}</Link> · {when(item.created_at)}
                  </p>
                  <p>{item.body}</p>
                  <button type="button" className={styles.remove} onClick={() => removeComment(item.id)}>
                    {s.remove}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.card}>
            <h2>
              {t.photosTitle} <span className={styles.count}>{photos?.length ?? 0}</span>
            </h2>
            {photos?.length === 0 && <p className={styles.muted}>{t.noPhotos}</p>}
            <ul className={styles.photos}>
              {photos?.map((item) => (
                <li key={item.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image_path} alt={titleOf(item.recipes)} loading="lazy" />
                  <p className={styles.muted}>
                    <Link href={href(item.recipes)}>{titleOf(item.recipes)}</Link>
                  </p>
                  <button type="button" className={styles.remove} onClick={() => removePhoto(item)}>
                    {s.remove}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {!isAdmin && (
          <section className={`${styles.card} ${styles.danger}`}>
            <h2>{t.deleteTitle}</h2>
            <p className={styles.muted}>{t.deleteText}</p>
            <button type="button" className={styles.deleteButton} onClick={removeAccount}>
              {t.deleteAccount}
            </button>
            {problem && <p className={styles.error}>{problem}</p>}
          </section>
        )}
      </div>
    </section>
  );
}
