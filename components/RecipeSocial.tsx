"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { notifyNewPost, notifyReplies } from "@/app/actions/notify";
import { shrinkImage } from "@/lib/shrink-image";
import { getDictionary } from "@/lib/dictionaries";
import { localePath } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import CommentComposer from "./CommentComposer";
import styles from "./RecipeSocial.module.css";

type Person = { display_name: string; avatar_url: string | null } | null;
type Comment = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  mentions: string[] | null;
  profiles: Person;
};
type Recreation = { id: string; image_path: string; caption: string | null; created_at: string; user_id: string; profiles: Person };

const BUCKET = "recreations";

// Likes on photos, comments with replies and @mentions, and "I made this" photos for one recipe.
export default function RecipeSocial({ recipeId, slug, lang }: { recipeId: string; slug: string; lang: Locale }) {
  const t = getDictionary(lang).social;
  const [supabase] = useState(() => createClient());
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [recreations, setRecreations] = useState<Recreation[]>([]);
  // photo id -> the people who liked it
  const [photoLikes, setPhotoLikes] = useState<Record<string, string[]>>({});
  // everyone we know a name for (commenters, people who liked the recipe, people who were mentioned)
  const [names, setNames] = useState<Record<string, string>>({});
  // the comment that is being answered right now
  const [replyTo, setReplyTo] = useState<{ rootId: string; userId: string; name: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  // the photo shown large, in front of the page
  const [openPhoto, setOpenPhoto] = useState<Recreation | null>(null);

  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    const id = auth.user?.id ?? null;
    const [commentRows, photoRows, likerRows, profile] = await Promise.all([
      supabase
        .from("comments")
        .select("id, body, created_at, user_id, parent_id, mentions, profiles(display_name, avatar_url)")
        .eq("recipe_id", recipeId)
        .order("created_at", { ascending: false }),
      supabase
        .from("recreations")
        .select("id, image_path, caption, created_at, user_id, profiles(display_name, avatar_url)")
        .eq("recipe_id", recipeId)
        .order("created_at", { ascending: false }),
      supabase.from("likes").select("user_id, profiles(display_name)").eq("recipe_id", recipeId),
      id ? supabase.from("profiles").select("role").eq("id", id).maybeSingle() : Promise.resolve({ data: null }),
    ]);
    const list = (commentRows.data ?? []) as unknown as Comment[];
    const photos = (photoRows.data ?? []) as unknown as Recreation[];

    const known: Record<string, string> = {};
    for (const c of list) if (c.profiles?.display_name) known[c.user_id] = c.profiles.display_name;
    for (const l of (likerRows.data ?? []) as unknown as { user_id: string; profiles: { display_name: string } | null }[]) {
      if (l.profiles?.display_name) known[l.user_id] = l.profiles.display_name;
    }
    // names of mentioned people we have not met yet
    const missing = [...new Set(list.flatMap((c) => c.mentions ?? []))].filter((m) => !known[m]);
    if (missing.length) {
      const { data } = await supabase.from("profiles").select("id, display_name").in("id", missing);
      for (const p of data ?? []) known[p.id as string] = p.display_name as string;
    }

    const likesOnPhotos: Record<string, string[]> = {};
    if (photos.length) {
      const { data } = await supabase.from("recreation_likes").select("recreation_id, user_id").in("recreation_id", photos.map((p) => p.id));
      for (const row of data ?? []) (likesOnPhotos[row.recreation_id as string] ??= []).push(row.user_id as string);
    }

    setUserId(id);
    setIsAdmin(profile.data?.role === "admin");
    setComments(list);
    setRecreations(photos);
    setPhotoLikes(likesOnPhotos);
    setNames(known);
  }, [supabase, recipeId]);

  // Escape closes the large photo
  useEffect(() => {
    if (!openPhoto) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpenPhoto(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openPhoto]);

  useEffect(() => {
    Promise.resolve().then(load);
    const { data } = supabase.auth.onAuthStateChange(() => void load());
    return () => data.subscription.unsubscribe();
  }, [load, supabase]);

  const loginHref = `${localePath(lang, "/login")}?next=${encodeURIComponent(localePath(lang, `/recipes/${slug}`))}`;
  const when = (iso: string) => new Date(iso).toLocaleDateString(lang === "bs" ? "bs-BA" : "en-GB", { dateStyle: "medium" });
  const who = (person: Person) => person?.display_name || t.someone;

  // people who can be @mentioned: the ones we know on this recipe, except yourself
  const candidates = Object.entries(names)
    .filter(([id]) => id !== userId)
    .map(([id, name]) => ({ id, name }));

  // tell the administrator, and the people a comment is meant for, by email (does nothing until email is set up)
  const announce = async (kind: "comment" | "recreation", id: string) => {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      await notifyNewPost(kind, id, data.session.access_token);
      if (kind === "comment") await notifyReplies(id, data.session.access_token);
    } catch {
      // the post is saved either way
    }
  };

  const addComment = async (body: string, mentions: string[], parentId: string | null): Promise<boolean> => {
    if (!userId) return false;
    setBusy(true);
    setProblem("");
    const { data, error } = await supabase
      .from("comments")
      .insert({ recipe_id: recipeId, user_id: userId, body, parent_id: parentId, mentions })
      .select("id")
      .single();
    if (error) setProblem(t.error);
    else {
      setReplyTo(null);
      void announce("comment", data.id);
    }
    await load();
    setBusy(false);
    return !error;
  };

  const removeComment = async (id: string) => {
    if (!window.confirm(t.confirmComment)) return;
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
    if (!window.confirm(t.confirmPhoto)) return;
    setOpenPhoto(null);
    await supabase.from("recreations").delete().eq("id", item.id);
    const marker = `/${BUCKET}/`;
    const at = item.image_path.indexOf(marker);
    if (at >= 0) await supabase.storage.from(BUCKET).remove([item.image_path.slice(at + marker.length)]);
    await load();
  };

  const togglePhotoLike = async (photoId: string) => {
    if (!userId) return;
    const current = photoLikes[photoId] ?? [];
    const liked = current.includes(userId);
    setPhotoLikes({ ...photoLikes, [photoId]: liked ? current.filter((u) => u !== userId) : [...current, userId] });
    const { error } = liked
      ? await supabase.from("recreation_likes").delete().eq("recreation_id", photoId).eq("user_id", userId)
      : await supabase.from("recreation_likes").insert({ recreation_id: photoId, user_id: userId });
    if (error) void load();
  };

  const photoHeart = (photoId: string) => {
    const likers = photoLikes[photoId] ?? [];
    const liked = userId !== null && likers.includes(userId);
    const heart = (
      <svg viewBox="0 0 24 24" width="18" height="18" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20.5s-8-4.7-8-10.6A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8 2.9c0 5.9-8 10.6-8 10.6Z" />
      </svg>
    );
    const likerNames = likers.map((id) => names[id]).filter(Boolean).join(", ");
    return userId ? (
      <button type="button" className={`${styles.photoLike} ${liked ? styles.photoLiked : ""}`} aria-pressed={liked} title={likerNames || t.photoLike} onClick={() => togglePhotoLike(photoId)}>
        {heart}
        <span>{likers.length}</span>
      </button>
    ) : (
      <Link href={loginHref} className={styles.photoLike} title={t.loginToLike}>
        {heart}
        <span>{likers.length}</span>
      </Link>
    );
  };

  // the text of a comment, with the @names of mentioned people highlighted
  const body = (comment: Comment) => {
    const tags = (comment.mentions ?? []).map((id) => names[id]).filter(Boolean).map((n) => `@${n}`);
    if (!tags.length) return comment.body;
    const pattern = new RegExp(`(${tags.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
    return comment.body.split(pattern).map((part, i) =>
      tags.includes(part) ? (
        <span key={i} className={styles.mention}>
          {part}
        </span>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      ),
    );
  };

  const roots = comments.filter((c) => !c.parent_id);
  const repliesOf = (id: string) => comments.filter((c) => c.parent_id === id).sort((a, b) => a.created_at.localeCompare(b.created_at));

  const commentCard = (comment: Comment, rootId: string) => (
    <div className={styles.bubble}>
      <p className={styles.by}>
        <strong>{who(comment.profiles)}</strong> · {when(comment.created_at)}
      </p>
      <p className={styles.text}>{body(comment)}</p>
      <div className={styles.actionsRow}>
        {userId && (
          <button
            type="button"
            className={styles.remove}
            onClick={() => setReplyTo({ rootId, userId: comment.user_id, name: who(comment.profiles) })}
          >
            {t.reply}
          </button>
        )}
        {(comment.user_id === userId || isAdmin) && (
          <button type="button" className={styles.remove} onClick={() => removeComment(comment.id)}>
            {t.remove}
          </button>
        )}
      </div>
    </div>
  );

  const replyBox = (rootId: string) =>
    replyTo?.rootId === rootId && (
      <div className={styles.replyBox}>
        <CommentComposer
          // a new box for every person that is answered, so its text and picked names start fresh
          key={`${replyTo.rootId}-${replyTo.userId}`}
          placeholder={t.replyPlaceholder}
          submitLabel={t.post}
          cancelLabel={t.cancel}
          mentionHint={t.mentionHint}
          initialText={replyTo.userId !== userId ? `@${replyTo.name} ` : ""}
          initialMentions={replyTo.userId !== userId ? { [replyTo.userId]: replyTo.name } : {}}
          candidates={candidates}
          busy={busy}
          rows={2}
          onSubmit={(text, ids) => addComment(text, ids, rootId)}
          onCancel={() => setReplyTo(null)}
        />
      </div>
    );

  return (
    <section className={styles.social} aria-label={t.title}>
      <div className={styles.columns}>
        <div className={styles.block}>
          <h2>
            <span className={styles.icon} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 5h16v11H9l-5 4z" />
              </svg>
            </span>
            <span className={styles.count}>{comments.length}</span> {t.commentsTitle}
          </h2>
          {userId ? (
            <CommentComposer
              placeholder={t.commentPlaceholder}
              submitLabel={t.post}
              mentionHint={t.mentionHint}
              candidates={candidates}
              busy={busy}
              fieldClass={styles.mainField}
              onSubmit={(text, ids) => addComment(text, ids, null)}
            />
          ) : (
            <p className={styles.login}>
              <Link href={loginHref}>{t.loginToComment}</Link>
            </p>
          )}
          {comments.length === 0 && <p className={styles.empty}>{t.noComments}</p>}
          <ul className={styles.comments}>
            {roots.map((comment) => (
              <li key={comment.id}>
                <span className={styles.avatar} aria-hidden="true">
                  {who(comment.profiles).slice(0, 1).toUpperCase()}
                </span>
                <div className={styles.thread}>
                  {commentCard(comment, comment.id)}
                  {repliesOf(comment.id).length > 0 && (
                    <ul className={styles.replies}>
                      {repliesOf(comment.id).map((reply) => (
                        <li key={reply.id}>
                          <span className={`${styles.avatar} ${styles.avatarSmall}`} aria-hidden="true">
                            {who(reply.profiles).slice(0, 1).toUpperCase()}
                          </span>
                          {commentCard(reply, comment.id)}
                        </li>
                      ))}
                    </ul>
                  )}
                  {replyBox(comment.id)}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.block}>
          <h2>
            <span className={styles.icon} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                <circle cx="12" cy="13" r="3.5" />
              </svg>
            </span>
            {t.madeTitle}
          </h2>
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
                <button type="button" className={styles.photoButton} onClick={() => setOpenPhoto(item)} aria-label={t.openPhoto}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image_path} alt={item.caption || t.madeAlt} loading="lazy" />
                </button>
                <p className={styles.by}>
                  <strong>{who(item.profiles)}</strong> · {when(item.created_at)}
                </p>
                {item.caption && <p>{item.caption}</p>}
                <div className={styles.actionsRow}>
                  {photoHeart(item.id)}
                  {(item.user_id === userId || isAdmin) && (
                    <button type="button" className={styles.remove} onClick={() => removePhoto(item)}>
                      {t.remove}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {problem && <p className={styles.problem}>{problem}</p>}

      {openPhoto && (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={t.madeTitle} onClick={() => setOpenPhoto(null)}>
          <figure onClick={(event) => event.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={openPhoto.image_path} alt={openPhoto.caption || t.madeAlt} />
            <figcaption>
              <strong>{who(openPhoto.profiles)}</strong> · {when(openPhoto.created_at)}
              {openPhoto.caption && <span> · {openPhoto.caption}</span>}
              <span className={styles.lightboxLike}>{photoHeart(openPhoto.id)}</span>
            </figcaption>
          </figure>
          <button type="button" className={styles.closeButton} onClick={() => setOpenPhoto(null)} aria-label={t.close} autoFocus>
            ×
          </button>
        </div>
      )}
    </section>
  );
}
