"use server";

import { createClient } from "@supabase/supabase-js";

import { SITE_URL as SITE } from "@/lib/site";

// Sends the administrator an email when a visitor posts a comment or a photo.
// Called by the browser right after the post was saved. It checks that the post really exists, belongs to the
// person who is logged in, is fresh and was not announced yet, so it cannot be used to send arbitrary emails.
// Without RESEND_API_KEY (or the service key) it quietly does nothing, so the site works before this is set up.
export async function notifyNewPost(kind: "comment" | "recreation", id: string, accessToken: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resend = process.env.RESEND_API_KEY;
  if (!url || !service || !resend) return;

  const anon = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
  const { data: auth } = await anon.auth.getUser(accessToken);
  if (!auth.user) return;

  const admin = createClient(url, service, { auth: { persistSession: false } });
  const table = kind === "comment" ? "comments" : "recreations";
  const { data: row } = await admin
    .from(table)
    .select("*, profiles(display_name), recipes(slug)")
    .eq("id", id)
    .maybeSingle();
  if (!row || row.user_id !== auth.user.id || row.notified) return;
  if (Date.now() - new Date(row.created_at).getTime() > 10 * 60 * 1000) return;

  // mark it first, so two quick calls cannot send two emails
  await admin.from(table).update({ notified: true }).eq("id", id);

  const who = row.profiles?.display_name ?? "Someone";
  const slug = row.recipes?.slug ?? "";
  const page = `${SITE}/en/recipes/${slug}`;
  const text =
    kind === "comment"
      ? `${who} commented on ${slug}:\n\n${row.body}\n\n${page}\n\nDelete it, if needed, in the dashboard: ${SITE}/en/admin`
      : `${who} shared a photo of ${slug}.\n\n${page}\n\nDelete it, if needed, in the dashboard: ${SITE}/en/admin`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resend}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Sweet & Salty Diaries <onboarding@resend.dev>",
      to: [process.env.ADMIN_EMAIL ?? "valjevac.sadzida002@gmail.com"],
      subject: kind === "comment" ? `New comment on ${slug}` : `New photo on ${slug}`,
      text,
    }),
  });
}
