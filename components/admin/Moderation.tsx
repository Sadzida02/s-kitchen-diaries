"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import styles from "./Admin.module.css";

type Person = { display_name: string } | null;
type Comment = { id: string; body: string; created_at: string; profiles: Person; recipes: { slug: string } | null };
type Photo = { id: string; image_path: string; caption: string | null; created_at: string; profiles: Person; recipes: { slug: string } | null };

// The newest comments and photos from visitors, with a button to delete anything that does not belong.
export default function Moderation({ supabase }: { supabase: SupabaseClient }) {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [photos, setPhotos] = useState<Photo[] | null>(null);

  const load = useCallback(async () => {
    const [c, p] = await Promise.all([
      supabase
        .from("comments")
        .select("id, body, created_at, profiles(display_name), recipes(slug)")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("recreations")
        .select("id, image_path, caption, created_at, profiles(display_name), recipes(slug)")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    setComments((c.data ?? []) as unknown as Comment[]);
    setPhotos((p.data ?? []) as unknown as Photo[]);
  }, [supabase]);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  const removeComment = async (id: string) => {
    await supabase.from("comments").delete().eq("id", id);
    await load();
  };

  const removePhoto = async (item: Photo) => {
    await supabase.from("recreations").delete().eq("id", item.id);
    const marker = "/recreations/";
    const at = item.image_path.indexOf(marker);
    if (at >= 0) await supabase.storage.from("recreations").remove([item.image_path.slice(at + marker.length)]);
    await load();
  };

  const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className={styles.two}>
      <section>
        <h2>Latest comments</h2>
        {comments === null && <p className={styles.center}>Loading…</p>}
        {comments?.length === 0 && <p>No comments yet.</p>}
        <ul className={styles.feed}>
          {comments?.map((item) => (
            <li key={item.id}>
              <p className={styles.meta}>
                <strong>{item.profiles?.display_name ?? "Someone"}</strong> on {item.recipes?.slug} · {when(item.created_at)}
              </p>
              <p>{item.body}</p>
              <button type="button" className={styles.danger} onClick={() => removeComment(item.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Latest photos</h2>
        {photos === null && <p className={styles.center}>Loading…</p>}
        {photos?.length === 0 && <p>No photos yet.</p>}
        <ul className={styles.feed}>
          {photos?.map((item) => (
            <li key={item.id}>
              <p className={styles.meta}>
                <strong>{item.profiles?.display_name ?? "Someone"}</strong> on {item.recipes?.slug} · {when(item.created_at)}
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image_path} alt={item.caption ?? "Photo from a visitor"} className={styles.thumb} />
              {item.caption && <p>{item.caption}</p>}
              <button type="button" className={styles.danger} onClick={() => removePhoto(item)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
