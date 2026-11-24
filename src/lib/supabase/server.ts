import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Supabase client bound to the visitor's session cookies (used by /admin and server actions). */
export async function createClient() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try { list.forEach(({ name, value, options }) => store.set(name, value, options)); }
        catch { /* called from a Server Component: the proxy refreshes the session instead */ }
      },
    },
  });
}

/** Verified admin check. getClaims() validates the JWT signature; app_metadata can only be set server-side. */
export async function getAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims as { email?: string; app_metadata?: { role?: string } } | undefined;
  const isAdmin = claims?.app_metadata?.role === "admin";
  return { supabase, isAdmin, email: claims?.email ?? "" };
}
