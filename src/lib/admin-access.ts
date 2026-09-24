import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Comma-separated allowlist from ADMIN_EMAIL (case-insensitive). */
export function adminEmailAllowlist(): string[] {
  return (process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAdminEmail(email: string | undefined | null): boolean {
  const allow = adminEmailAllowlist();
  if (allow.length === 0 || !email) return false;
  return allow.includes(email.trim().toLowerCase());
}

/**
 * Admin if email is on ADMIN_EMAIL allowlist OR profiles.role = admin.
 * Used by middleware, server actions, and post-login redirects.
 */
export async function userHasAdminAccess(
  supabase: SupabaseClient,
  user: Pick<User, "id" | "email">
): Promise<boolean> {
  if (isAllowedAdminEmail(user.email)) return true;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return profile?.role === "admin";
}
