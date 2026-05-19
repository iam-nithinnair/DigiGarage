import { createBrowserClient } from '@supabase/ssr'

let cachedClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase credentials missing! Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your environment."
    );
  }

  cachedClient = createBrowserClient(url, key);
  return cachedClient;
}
