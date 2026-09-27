import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ConfigError } from "./errors";

let client: SupabaseClient | null = null;

/**
 * Server-side Supabase client using the service_role key.
 * `server-only` guarantees this module (and the key) can never be bundled for the browser.
 */
export function getSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new ConfigError(
      "Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local (see .env.example).",
    );
  }
  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
