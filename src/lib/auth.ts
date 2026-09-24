import { createClient } from "@/lib/supabase/server";
import { userHasAdminAccess } from "@/lib/admin-access";
import type { Profile, UserRole } from "@/types/database";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<(Profile & { email?: string }) | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return {
      id: user.id,
      role: "user" as UserRole,
      created_at: user.created_at,
      email: user.email,
    };
  }

  return { ...profile, email: user.email ?? undefined };
}

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  if (!(await userHasAdminAccess(supabase, user))) return null;
  return getCurrentProfile();
}
