import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// The Supabase connection used on the server: it reads the visitor's login from the cookies.
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // called from a page that cannot set cookies: harmless, the callback route does it
        }
      },
    },
  });
}
