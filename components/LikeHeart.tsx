"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toggleLike, useLikes } from "@/lib/likes";
import { getDictionary } from "@/lib/dictionaries";
import { localePath } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import styles from "./LikeHeart.module.css";

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20.5s-8-4.7-8-10.6A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8 2.9c0 5.9-8 10.6-8 10.6Z" />
    </svg>
  );
}

// The little heart on a recipe card. Signed-out visitors are sent to the login page first.
export function LikeHeart({ recipeId, lang }: { recipeId: string; lang: Locale }) {
  const t = getDictionary(lang).social;
  const likes = useLikes();
  const router = useRouter();
  const pathname = usePathname();
  const liked = likes.liked(recipeId);
  const count = likes.count(recipeId);

  return (
    <button
      type="button"
      data-sound="none"
      className={`${styles.heart} ${liked ? styles.on : ""}`}
      aria-pressed={liked}
      aria-label={liked ? t.liked : t.like}
      title={likes.userId ? (liked ? t.liked : t.like) : t.loginToLike}
      onClick={() => {
        if (likes.userId) void toggleLike(recipeId);
        else router.push(`${localePath(lang, "/login")}?next=${encodeURIComponent(pathname)}`);
      }}
    >
      <Heart filled={liked} />
      {count > 0 && <span>{count}</span>}
    </button>
  );
}

// The heart on the recipe page: the heart likes, the number next to it opens the list of people who liked the recipe.
export function RecipeLike({ recipeId, lang }: { recipeId: string; lang: Locale }) {
  const t = getDictionary(lang).social;
  const likes = useLikes();
  const router = useRouter();
  const pathname = usePathname();
  const liked = likes.liked(recipeId);
  const count = likes.count(recipeId);
  const [open, setOpen] = useState(false);
  const label = `${likes.userId ? (liked ? t.liked : t.like) : t.loginToLike} (${count})`;

  return (
    <span className={styles.bigWrap}>
      <button
        type="button"
        data-sound="none"
        className={`${styles.big} ${liked ? styles.bigOn : ""}`}
        aria-pressed={liked}
        aria-label={label}
        title={label}
        onClick={() => {
          if (likes.userId) void toggleLike(recipeId);
          else router.push(`${localePath(lang, "/login")}?next=${encodeURIComponent(pathname)}`);
        }}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 20.5s-8-4.7-8-10.6A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8 2.9c0 5.9-8 10.6-8 10.6Z" />
        </svg>
      </button>
      <button type="button" data-sound="none" className={styles.bigCount} disabled={count === 0} onClick={() => setOpen(true)} aria-label={t.seeLikers} title={t.seeLikers}>
        {count}
      </button>
      {open && <Likers recipeId={recipeId} lang={lang} onClose={() => setOpen(false)} />}
    </span>
  );
}

type Liker = { user_id: string; profiles: { display_name: string; avatar_url: string | null } | null };

// The list of people who liked a recipe (names and pictures), in front of the page.
function Likers({ recipeId, lang, onClose }: { recipeId: string; lang: Locale; onClose: () => void }) {
  const t = getDictionary(lang).social;
  const [people, setPeople] = useState<Liker[] | null>(null);

  useEffect(() => {
    createClient()
      .from("likes")
      .select("user_id, profiles(display_name, avatar_url)")
      .eq("recipe_id", recipeId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setPeople((data ?? []) as unknown as Liker[]));
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [recipeId, onClose]);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={t.likedBy} onClick={onClose}>
      <div className={styles.dialog} onClick={(event) => event.stopPropagation()}>
        <h2>{t.likedBy}</h2>
        {people === null && <p>…</p>}
        {people?.length === 0 && <p>{t.noLikers}</p>}
        <ul>
          {people?.map((person) => (
            <li key={person.user_id}>
              <span className={styles.likerAvatar} aria-hidden="true">
                {person.profiles?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={person.profiles.avatar_url} alt="" referrerPolicy="no-referrer" />
                ) : (
                  (person.profiles?.display_name ?? t.someone).slice(0, 1).toUpperCase()
                )}
              </span>
              {person.profiles?.display_name ?? t.someone}
            </li>
          ))}
        </ul>
        <button type="button" className={styles.dialogClose} onClick={onClose}>
          {t.close}
        </button>
      </div>
    </div>
  );
}
