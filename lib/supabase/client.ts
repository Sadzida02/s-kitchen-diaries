import { createBrowserClient } from "@supabase/ssr";

// The Supabase connection used inside the browser (login buttons, likes, comments).
// The key here is the public "publishable" one: it is safe to be seen, the database rules protect the data.
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
