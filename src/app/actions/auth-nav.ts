"use server";

import { createClient } from "@/lib/supabase/server";
import { userHasAdminAccess } from "@/lib/admin-access";

/** Whether the signed-in user may access /admin. */
export async function checkIsAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  return userHasAdminAccess(supabase, user);
}

/**
 * Where to send the user after login/signup.
 * Honors ADMIN_EMAIL allowlist (not only profiles.role).
 */
export async function getPostLoginPath(nextPath?: string): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "/";

  if (await userHasAdminAccess(supabase, user)) {
    return "/admin";
  }

  if (nextPath) {
    const cleaned = nextPath.replace(/^\/(en|mm)/, "") || "/";
    if (cleaned.startsWith("/admin")) return "/";
    return cleaned;
  }

  return "/";
}
