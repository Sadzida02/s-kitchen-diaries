"use server";

import { updateTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";

// After the dashboard saves a recipe, the website's cached recipe list is thrown away so the change shows up
// at once. Only the administrator may do this: the login token is checked against the database.
export async function refreshRecipes(accessToken: string) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false },
  });
  const { data: auth } = await supabase.auth.getUser(accessToken);
  if (!auth.user) throw new Error("Not signed in");
  const { data } = await supabase.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
  if (data?.role !== "admin") throw new Error("Not allowed");
  updateTag("recipes");
}
