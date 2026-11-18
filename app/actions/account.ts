"use server";

import { createClient } from "@supabase/supabase-js";

// Deletes the logged-in person's account: their uploaded photo files and the account itself.
// The database then removes their profile, likes, comments and photo entries automatically.
// The administrator account cannot be deleted from here.
export async function deleteAccount(accessToken: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) throw new Error("Account deletion is not set up yet.");

  const anon = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
  const { data: auth } = await anon.auth.getUser(accessToken);
  if (!auth.user) throw new Error("Not signed in");
  const userId = auth.user.id;

  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: profile } = await admin.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (profile?.role === "admin") throw new Error("The administrator account cannot be deleted here.");

  const { data: files } = await admin.storage.from("recreations").list(userId, { limit: 1000 });
  if (files?.length) await admin.storage.from("recreations").remove(files.map((file) => `${userId}/${file.name}`));

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
}
