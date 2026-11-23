"use server";

import { createClient } from "@supabase/supabase-js";
import { sendMail } from "@/lib/mail";
import { SITE_URL as SITE } from "@/lib/site";

// Both actions below are called by the browser right after a post was saved. They check that the post really
// exists, belongs to the person who is logged in, is fresh and was not announced yet, so they cannot be used to
// send arbitrary emails. Without the email key or the service key they quietly do nothing.

function clients() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service || !process.env.RESEND_API_KEY) return null;
  return {
    anon: createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } }),
    admin: createClient(url, service, { auth: { persistSession: false } }),
  };
}

const fresh = (iso: string) => Date.now() - new Date(iso).getTime() < 10 * 60 * 1000;

// Sends the administrator an email when a visitor posts a comment or a photo.
export async function notifyNewPost(kind: "comment" | "recreation", id: string, accessToken: string) {
  const c = clients();
  if (!c) return;
  const { data: auth } = await c.anon.auth.getUser(accessToken);
  if (!auth.user) return;

  const table = kind === "comment" ? "comments" : "recreations";
  const { data: row } = await c.admin.from(table).select("*, profiles(display_name), recipes(slug)").eq("id", id).maybeSingle();
  if (!row || row.user_id !== auth.user.id || row.notified || !fresh(row.created_at)) return;

  // mark it first, so two quick calls cannot send two emails
  await c.admin.from(table).update({ notified: true }).eq("id", id);

  const who = row.profiles?.display_name ?? "Someone";
  const slug = row.recipes?.slug ?? "";
  const page = `${SITE}/en/recipes/${slug}`;
  const text =
    kind === "comment"
      ? `${who} commented on ${slug}:\n\n${row.body}\n\n${page}\n\nDelete it, if needed, in the dashboard: ${SITE}/en/admin`
      : `${who} shared a photo of ${slug}.\n\n${page}\n\nDelete it, if needed, in the dashboard: ${SITE}/en/admin`;
  await sendMail(process.env.ADMIN_EMAIL ?? "valjevac.sadzida002@gmail.com", kind === "comment" ? `New comment on ${slug}` : `New photo on ${slug}`, text);
}

// Emails the people a comment is meant for: everyone who was @mentioned, and the author of the comment that was
// replied to. Nobody is emailed about their own comment, nobody twice, and nobody who turned emails off.
export async function notifyReplies(commentId: string, accessToken: string) {
  const c = clients();
  if (!c) return;
  const { data: auth } = await c.anon.auth.getUser(accessToken);
  if (!auth.user) return;

  const { data: comment } = await c.admin
    .from("comments")
    .select("id, body, created_at, user_id, parent_id, mentions, emails_sent, profiles(display_name), recipes(slug)")
    .eq("id", commentId)
    .maybeSingle();
  if (!comment || comment.user_id !== auth.user.id || comment.emails_sent || !fresh(comment.created_at)) return;
  await c.admin.from("comments").update({ emails_sent: true }).eq("id", commentId);

  const mentioned = new Set<string>((comment.mentions ?? []).slice(0, 5));
  let replyTo: string | null = null;
  if (comment.parent_id) {
    const { data: parent } = await c.admin.from("comments").select("user_id").eq("id", comment.parent_id).maybeSingle();
    replyTo = parent?.user_id ?? null;
  }

  // who gets which kind of email (a person who is both mentioned and replied to gets the mention)
  const targets = new Map<string, "mention" | "reply">();
  if (replyTo) targets.set(replyTo, "reply");
  for (const id of mentioned) targets.set(id, "mention");
  targets.delete(comment.user_id);

  const author = comment.profiles as unknown as { display_name: string } | null;
  const recipe = comment.recipes as unknown as { slug: string } | null;
  const who = author?.display_name ?? "Someone";
  const slug = recipe?.slug ?? "";
  const quote = comment.body.length > 400 ? `${comment.body.slice(0, 400)}…` : comment.body;

  for (const [userId, kind] of targets) {
    const { data: profile } = await c.admin.from("profiles").select("email_notifications").eq("id", userId).maybeSingle();
    if (!profile || profile.email_notifications === false) continue;
    const { data: person } = await c.admin.auth.admin.getUserById(userId);
    const email = person.user?.email;
    if (!email) continue;

    const link = `${SITE}/en/recipes/${slug}`;
    const linkBs = `${SITE}/bs/recipes/${slug}`;
    const settings = `${SITE}/en/profile`;
    const subject = kind === "mention" ? `${who} mentioned you in a comment` : `${who} replied to your comment`;
    const textEn = kind === "mention" ? `${who} mentioned you in a comment on ${slug}:` : `${who} replied to your comment on ${slug}:`;
    const textBs = kind === "mention" ? `${who} te spomenula/spomenuo u komentaru na ${slug}.` : `${who} je odgovorila/odgovorio na tvoj komentar na ${slug}.`;
    await sendMail(
      email,
      subject,
      `${textEn}\n\n"${quote}"\n\nOpen the recipe: ${link}\n\n---\n${textBs}\nOtvori recept: ${linkBs}\n\nYou can turn these emails off on your profile page: ${settings}\nEmailove možeš isključiti na svom profilu: ${SITE}/bs/profile`,
    );
  }
}
