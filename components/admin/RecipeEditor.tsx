"use client";

import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { refreshRecipes } from "@/app/actions/recipes";
import { DIFFICULTIES, TAGS, TASTES } from "@/lib/recipe-types";
import { formatGroups, parseGroups, slugify } from "@/lib/recipe-text";
import { shrinkImage } from "@/lib/shrink-image";
import type { RecipeSection } from "@/lib/recipe-types";
import styles from "./Admin.module.css";

type Words = { title: string; alt: string; intro: string; ingredients: string; steps: string };
type Form = {
  slug: string;
  taste: string;
  difficulty: string;
  tags: string[];
  added: string;
  podium: string;
  published: boolean;
  cover: string;
  photos: string[];
  en: Words;
  bs: Words;
};

const emptyWords: Words = { title: "", alt: "", intro: "", ingredients: "", steps: "" };
const today = () => new Date().toISOString().slice(0, 10);
const blank = (): Form => ({
  slug: "",
  taste: "sweet",
  difficulty: "easy",
  tags: [],
  added: today(),
  podium: "",
  published: true,
  cover: "",
  photos: [],
  en: { ...emptyWords },
  bs: { ...emptyWords },
});

type Translation = {
  lang: string;
  title: string;
  alt: string | null;
  intro: string;
  ingredient_groups: RecipeSection[];
  step_groups: RecipeSection[];
};

const wordsOf = (t?: Translation): Words =>
  t
    ? { title: t.title, alt: t.alt ?? "", intro: t.intro, ingredients: formatGroups(t.ingredient_groups ?? []), steps: formatGroups(t.step_groups ?? []) }
    : { ...emptyWords };

export default function RecipeEditor({ supabase, id, onBack }: { supabase: SupabaseClient; id: string | null; onBack: () => void }) {
  const [form, setForm] = useState<Form | null>(id ? null : blank());
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [recipeId, setRecipeId] = useState<string | null>(id);

  useEffect(() => {
    if (!id) return;
    Promise.resolve()
      .then(() => supabase.from("recipes").select("*, recipe_translations(*), recipe_photos(*)").eq("id", id).single())
      .then(({ data }) => {
        if (!data) return setMessage("Could not load this recipe.");
        const translations = (data.recipe_translations ?? []) as Translation[];
        const extra = [...(data.recipe_photos ?? [])].sort((a: { sort: number }, b: { sort: number }) => a.sort - b.sort).map((p: { path: string }) => p.path);
        const cover = data.cover_image ?? "";
        setForm({
          slug: data.slug,
          taste: data.taste,
          difficulty: data.difficulty,
          tags: data.tags ?? [],
          added: data.added ?? today(),
          podium: data.podium ? String(data.podium) : "",
          published: data.published,
          cover,
          photos: [...(cover ? [cover] : []), ...extra.filter((p: string) => p !== cover)],
          en: wordsOf(translations.find((t) => t.lang === "en")),
          bs: wordsOf(translations.find((t) => t.lang === "bs")),
        });
      });
  }, [supabase, id]);

  if (!form) return <p className={styles.center}>{message || "Loading…"}</p>;

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((current) => (current ? { ...current, [key]: value } : current));
  const setWords = (lang: "en" | "bs", key: keyof Words, value: string) =>
    setForm((current) => (current ? { ...current, [lang]: { ...current[lang], [key]: value } } : current));

  const slug = form.slug || slugify(form.en.title);

  const upload = async (files: FileList | null) => {
    if (!files?.length || !slug) return setMessage("Give the recipe a title (or slug) before adding photos.");
    setBusy(true);
    setMessage("");
    try {
      const added: string[] = [];
      for (const file of Array.from(files)) {
        const blob = await shrinkImage(file);
        const path = `${slug}/${crypto.randomUUID()}.webp`;
        const sent = await supabase.storage.from("recipe-photos").upload(path, blob, { contentType: "image/webp" });
        if (sent.error) throw sent.error;
        added.push(supabase.storage.from("recipe-photos").getPublicUrl(path).data.publicUrl);
      }
      setForm((current) => (current ? { ...current, photos: [...current.photos, ...added], cover: current.cover || added[0] } : current));
    } catch (error) {
      setMessage(`Upload failed: ${(error as Error).message}`);
    }
    setBusy(false);
  };

  const removePhoto = (src: string) =>
    setForm((current) => {
      if (!current) return current;
      const photos = current.photos.filter((p) => p !== src);
      return { ...current, photos, cover: current.cover === src ? (photos[0] ?? "") : current.cover };
    });

  const save = async () => {
    if (!form.en.title.trim()) return setMessage("The English title is required.");
    if (!slug) return setMessage("The address (slug) is required.");
    setBusy(true);
    setMessage("");
    try {
      const row = {
        slug,
        taste: form.taste,
        tags: form.tags,
        difficulty: form.difficulty,
        cover_image: form.cover || null,
        added: form.added || today(),
        podium: form.podium ? Number(form.podium) : null,
        published: form.published,
      };
      let rid = recipeId;
      if (rid) {
        const { error } = await supabase.from("recipes").update(row).eq("id", rid);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("recipes").insert(row).select("id").single();
        if (error) throw error;
        rid = data.id as string;
        setRecipeId(rid);
      }

      const translation = (lang: "en" | "bs", words: Words) => ({
        recipe_id: rid,
        lang,
        title: words.title.trim(),
        alt: words.alt.trim() || null,
        intro: words.intro.trim(),
        ingredient_groups: parseGroups(words.ingredients),
        step_groups: parseGroups(words.steps),
      });
      const rows = [translation("en", form.en)];
      if (form.bs.title.trim()) rows.push(translation("bs", form.bs));
      const saved = await supabase.from("recipe_translations").upsert(rows, { onConflict: "recipe_id,lang" });
      if (saved.error) throw saved.error;
      if (!form.bs.title.trim()) await supabase.from("recipe_translations").delete().eq("recipe_id", rid).eq("lang", "bs");

      await supabase.from("recipe_photos").delete().eq("recipe_id", rid);
      const gallery = form.photos.filter((p) => p !== form.cover).map((path, sort) => ({ recipe_id: rid, path, sort }));
      if (gallery.length) {
        const photos = await supabase.from("recipe_photos").insert(gallery);
        if (photos.error) throw photos.error;
      }

      const { data: session } = await supabase.auth.getSession();
      if (session.session) await refreshRecipes(session.session.access_token);
      setMessage("Saved. The change is live on the site.");
    } catch (error) {
      setMessage(`Could not save: ${(error as { message?: string }).message ?? "unknown error"}`);
    }
    setBusy(false);
  };

  const wordsFields = (lang: "en" | "bs", label: string) => (
    <fieldset className={styles.fieldset}>
      <legend>{label}</legend>
      <label>
        Title {lang === "en" && "*"}
        <input type="text" value={form[lang].title} onChange={(e) => setWords(lang, "title", e.target.value)} />
      </label>
      <label>
        Short description
        <textarea rows={3} value={form[lang].intro} onChange={(e) => setWords(lang, "intro", e.target.value)} />
      </label>
      <label>
        Photo description (for screen readers)
        <input type="text" value={form[lang].alt} onChange={(e) => setWords(lang, "alt", e.target.value)} />
      </label>
      <label>
        Ingredients
        <small>One per line. Start a line with ## to make a heading, like “## For the cream”.</small>
        <textarea rows={9} value={form[lang].ingredients} onChange={(e) => setWords(lang, "ingredients", e.target.value)} />
      </label>
      <label>
        Steps
        <small>One step per line. “## Heading” starts a new group.</small>
        <textarea rows={9} value={form[lang].steps} onChange={(e) => setWords(lang, "steps", e.target.value)} />
      </label>
    </fieldset>
  );

  return (
    <div className={styles.editor}>
      <div className={styles.bar}>
        <button type="button" onClick={onBack}>
          ← All recipes
        </button>
        <button type="button" className={styles.primary} onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save recipe"}
        </button>
      </div>
      {message && <p className={message.startsWith("Saved") ? styles.ok : styles.error}>{message}</p>}

      <fieldset className={styles.fieldset}>
        <legend>Basics</legend>
        <div className={styles.grid}>
          <label>
            Address (slug)
            <input type="text" value={form.slug} placeholder={slugify(form.en.title) || "chocolate-brownies"} onChange={(e) => set("slug", slugify(e.target.value))} disabled={!!recipeId} />
            {recipeId && <small>The address of a saved recipe cannot change.</small>}
          </label>
          <label>
            Taste
            <select value={form.taste} onChange={(e) => set("taste", e.target.value)}>
              {TASTES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            Difficulty
            <select value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)}>
              {DIFFICULTIES.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <label>
            Date added
            <input type="date" value={form.added} onChange={(e) => set("added", e.target.value)} />
          </label>
          <label>
            Favourites podium place
            <select value={form.podium} onChange={(e) => set("podium", e.target.value)}>
              <option value="">Not on the podium</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.check}>
            <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} />
            Shown on the site
          </label>
        </div>
        <div className={styles.tags}>
          {TAGS.map((tag) => (
            <label key={tag} className={styles.check}>
              <input
                type="checkbox"
                checked={form.tags.includes(tag)}
                onChange={(e) => set("tags", e.target.checked ? [...form.tags, tag] : form.tags.filter((t) => t !== tag))}
              />
              {tag}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Photos</legend>
        <p className={styles.hint}>The first photo (the cover) is shown on cards. Add more for the photo stack on the recipe page.</p>
        <div className={styles.photos}>
          {form.photos.map((src) => (
            <figure key={src} className={src === form.cover ? styles.cover : ""}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" />
              <figcaption>
                {src === form.cover ? (
                  <strong>Cover</strong>
                ) : (
                  <button type="button" onClick={() => set("cover", src)}>
                    Make cover
                  </button>
                )}
                <button type="button" className={styles.danger} onClick={() => removePhoto(src)}>
                  Remove
                </button>
              </figcaption>
            </figure>
          ))}
          <label className={styles.addPhoto}>
            + Add photos
            <input type="file" accept="image/*" multiple hidden disabled={busy} onChange={(e) => { void upload(e.target.files); e.target.value = ""; }} />
          </label>
        </div>
      </fieldset>

      {wordsFields("en", "English")}
      {wordsFields("bs", "Bosnian (leave the title empty to show the English text)")}

      <div className={styles.bar}>
        <button type="button" onClick={onBack}>
          ← All recipes
        </button>
        <button type="button" className={styles.primary} onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save recipe"}
        </button>
      </div>
    </div>
  );
}
