"use client";

import { usePathname, useRouter } from "next/navigation";
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

// The heart on the recipe page: just the icon, next to the difficulty. The caption and the number are in its label.
export function RecipeLike({ recipeId, lang }: { recipeId: string; lang: Locale }) {
  const t = getDictionary(lang).social;
  const likes = useLikes();
  const router = useRouter();
  const pathname = usePathname();
  const liked = likes.liked(recipeId);
  const label = `${likes.userId ? (liked ? t.liked : t.like) : t.loginToLike} (${likes.count(recipeId)})`;

  return (
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
  );
}
