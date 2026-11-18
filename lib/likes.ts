"use client";

import { useSyncExternalStore } from "react";
import { createClient } from "./supabase/client";

// One shared list of who liked what, loaded once for the whole page, so a page full of
// recipe cards (and the big heart on a recipe) all use the same data and stay in step.
type Snapshot = { ready: boolean; userId: string | null; byRecipe: Record<string, string[]> };

const EMPTY: Snapshot = { ready: false, userId: null, byRecipe: {} };
let snapshot: Snapshot = EMPTY;
const listeners = new Set<() => void>();
let started = false;
let client: ReturnType<typeof createClient> | undefined;

const supabase = () => (client ??= createClient());

function publish(next: Snapshot) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

async function refresh() {
  const { data: auth } = await supabase().auth.getUser();
  const { data } = await supabase().from("likes").select("recipe_id, user_id").limit(10000);
  const byRecipe: Record<string, string[]> = {};
  for (const row of data ?? []) (byRecipe[row.recipe_id as string] ??= []).push(row.user_id as string);
  publish({ ready: true, userId: auth.user?.id ?? null, byRecipe });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!started) {
    started = true;
    void refresh();
    supabase().auth.onAuthStateChange(() => void refresh());
  }
  return () => {
    listeners.delete(listener);
  };
}

export function useLikes() {
  const state = useSyncExternalStore(subscribe, () => snapshot, () => EMPTY);
  return {
    ready: state.ready,
    userId: state.userId,
    count: (recipeId: string) => state.byRecipe[recipeId]?.length ?? 0,
    liked: (recipeId: string) => state.userId !== null && (state.byRecipe[recipeId] ?? []).includes(state.userId),
  };
}

// like or unlike; the heart changes at once and is put right again if saving fails
export async function toggleLike(recipeId: string) {
  const userId = snapshot.userId;
  if (!userId) return;
  const current = snapshot.byRecipe[recipeId] ?? [];
  const wasLiked = current.includes(userId);
  publish({
    ...snapshot,
    byRecipe: { ...snapshot.byRecipe, [recipeId]: wasLiked ? current.filter((id) => id !== userId) : [...current, userId] },
  });
  const { error } = wasLiked
    ? await supabase().from("likes").delete().eq("recipe_id", recipeId).eq("user_id", userId)
    : await supabase().from("likes").insert({ recipe_id: recipeId, user_id: userId });
  if (error) void refresh();
}
